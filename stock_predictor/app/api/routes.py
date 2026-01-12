"""
API Routes for Stock Predictor

Provides endpoints for data updates, training, and predictions.
"""

import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from ..data.sp500 import get_sp500_tickers
from ..data.prices import PriceDataManager
from ..features.engineering import FeatureEngineer
from ..models.trainer import ModelTrainer

logger = logging.getLogger(__name__)

router = APIRouter()

# Global state (in production, use proper state management)
class AppState:
    price_manager: Optional[PriceDataManager] = None
    feature_engineer: Optional[FeatureEngineer] = None
    model_trainer: Optional[ModelTrainer] = None
    is_updating_data: bool = False
    is_training: bool = False
    last_data_update: Optional[str] = None
    last_train: Optional[str] = None
    tickers: list[str] = []

state = AppState()


def get_price_manager() -> PriceDataManager:
    if state.price_manager is None:
        state.price_manager = PriceDataManager()
    return state.price_manager


def get_feature_engineer() -> FeatureEngineer:
    if state.feature_engineer is None:
        state.feature_engineer = FeatureEngineer()
    return state.feature_engineer


def get_model_trainer() -> ModelTrainer:
    if state.model_trainer is None:
        state.model_trainer = ModelTrainer()
    return state.model_trainer


# =========================================
# Request/Response Models
# =========================================

class StatusResponse(BaseModel):
    last_data_update: Optional[str]
    last_train: Optional[str]
    n_tickers: int
    model_exists: bool
    is_updating_data: bool
    is_training: bool


class DataUpdateRequest(BaseModel):
    max_tickers: Optional[int] = None
    years: int = 5
    force_refresh: bool = False


class DataUpdateResponse(BaseModel):
    status: str
    n_tickers_fetched: int
    timestamp: str


class TrainRequest(BaseModel):
    max_tickers: Optional[int] = None


class TrainResponse(BaseModel):
    status: str
    n_samples: int
    n_features: int
    mse: float
    spearman_corr: float
    residual_std: float
    timestamp: str


class PredictionItem(BaseModel):
    ticker: str
    predicted_return: float
    predicted_return_pct: str
    pred_lower: float
    pred_upper: float
    latest_date: str


class PredictionsResponse(BaseModel):
    top_5: list[PredictionItem]
    bottom_5: list[PredictionItem]
    latest_date: str
    model_timestamp: Optional[str]
    residual_std: float
    disclaimer: str


# =========================================
# Endpoints
# =========================================

@router.get("/status", response_model=StatusResponse)
async def get_status():
    """Get current system status."""
    trainer = get_model_trainer()
    model_info = trainer.get_model_info()
    manager = get_price_manager()

    return StatusResponse(
        last_data_update=manager.get_last_update() or state.last_data_update,
        last_train=model_info.get('last_train_timestamp'),
        n_tickers=len(state.tickers),
        model_exists=model_info.get('model_exists', False),
        is_updating_data=state.is_updating_data,
        is_training=state.is_training
    )


@router.post("/update-data", response_model=DataUpdateResponse)
async def update_data(request: DataUpdateRequest):
    """
    Update price data for S&P 500 stocks.

    This fetches/updates OHLCV data from yfinance.
    """
    if state.is_updating_data:
        raise HTTPException(status_code=409, detail="Data update already in progress")

    state.is_updating_data = True

    try:
        # Get S&P 500 tickers
        tickers = get_sp500_tickers(max_tickers=request.max_tickers)
        state.tickers = tickers

        logger.info(f"Updating data for {len(tickers)} tickers")

        # Fetch price data
        manager = get_price_manager()
        prices = manager.fetch_all_prices(
            tickers,
            years=request.years,
            force_refresh=request.force_refresh
        )

        # Also fetch SPY for market features
        manager.fetch_spy(years=request.years)

        timestamp = datetime.now().isoformat()
        state.last_data_update = timestamp

        return DataUpdateResponse(
            status="success",
            n_tickers_fetched=len(prices),
            timestamp=timestamp
        )

    except Exception as e:
        logger.error(f"Data update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        state.is_updating_data = False


@router.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """
    Train the prediction model.

    Uses time-series cross-validation to prevent look-ahead bias.
    """
    if state.is_training:
        raise HTTPException(status_code=409, detail="Training already in progress")

    state.is_training = True

    try:
        # Get tickers
        if not state.tickers:
            state.tickers = get_sp500_tickers(max_tickers=request.max_tickers)

        tickers = state.tickers[:request.max_tickers] if request.max_tickers else state.tickers

        # Load price data
        manager = get_price_manager()
        prices = manager.load_cached_prices(tickers)

        if not prices:
            raise HTTPException(
                status_code=400,
                detail="No price data available. Please update data first."
            )

        spy = manager.fetch_spy()

        # Create training dataset
        engineer = get_feature_engineer()
        dataset = engineer.create_training_dataset(prices, spy)

        if len(dataset) == 0:
            raise HTTPException(
                status_code=400,
                detail="Could not create training dataset. Check data quality."
            )

        # Train model
        trainer = get_model_trainer()
        result = trainer.train(dataset, engineer.get_feature_columns())

        state.last_train = result.train_timestamp

        return TrainResponse(
            status="success",
            n_samples=result.n_samples,
            n_features=result.n_features,
            mse=result.validation_metrics['mse_mean'],
            spearman_corr=result.validation_metrics['spearman_corr_mean'],
            residual_std=result.residual_std,
            timestamp=result.train_timestamp
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        state.is_training = False


@router.get("/predictions", response_model=PredictionsResponse)
async def get_predictions():
    """
    Generate stock predictions for the next 3 trading days.

    Returns the top 5 and bottom 5 stocks by predicted return.
    """
    DISCLAIMER = (
        "DISCLAIMER: This is a research tool, NOT financial advice. "
        "Predictions are based on historical patterns and may not reflect future performance. "
        "Do not use this for actual trading decisions. Past performance does not guarantee future results."
    )

    try:
        # Load model
        trainer = get_model_trainer()
        if not trainer.load_model():
            raise HTTPException(
                status_code=400,
                detail="No trained model available. Please train the model first."
            )

        # Get tickers
        if not state.tickers:
            state.tickers = get_sp500_tickers()

        # Load price data
        manager = get_price_manager()
        prices = manager.load_cached_prices(state.tickers)

        if not prices:
            raise HTTPException(
                status_code=400,
                detail="No price data available. Please update data first."
            )

        spy = manager.fetch_spy()

        # Create prediction features
        engineer = get_feature_engineer()
        engineer.feature_columns = trainer.feature_columns  # Use model's features
        features = engineer.create_prediction_features(prices, spy)

        if len(features) == 0:
            raise HTTPException(
                status_code=400,
                detail="Could not create prediction features."
            )

        # Generate predictions
        predictions = trainer.predict(features)

        # Sort by predicted return
        predictions = predictions.sort_values('predicted_return', ascending=False)

        # Get latest date
        latest_date = features.index.max().strftime('%Y-%m-%d')

        # Format top 5
        top_5 = []
        for _, row in predictions.head(5).iterrows():
            top_5.append(PredictionItem(
                ticker=row['ticker'],
                predicted_return=round(row['predicted_return'], 6),
                predicted_return_pct=f"{row['predicted_return']*100:.2f}%",
                pred_lower=round(row['pred_lower'], 6),
                pred_upper=round(row['pred_upper'], 6),
                latest_date=latest_date
            ))

        # Format bottom 5
        bottom_5 = []
        for _, row in predictions.tail(5).iloc[::-1].iterrows():
            bottom_5.append(PredictionItem(
                ticker=row['ticker'],
                predicted_return=round(row['predicted_return'], 6),
                predicted_return_pct=f"{row['predicted_return']*100:.2f}%",
                pred_lower=round(row['pred_lower'], 6),
                pred_upper=round(row['pred_upper'], 6),
                latest_date=latest_date
            ))

        return PredictionsResponse(
            top_5=top_5,
            bottom_5=bottom_5,
            latest_date=latest_date,
            model_timestamp=trainer.last_train_timestamp,
            residual_std=trainer.residual_std,
            disclaimer=DISCLAIMER
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

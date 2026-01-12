"""
Model Training Module

Trains ML models for stock return prediction with proper time-series validation.
"""

import pandas as pd
import numpy as np
import logging
import joblib
from pathlib import Path
from datetime import datetime
from typing import Optional, Any
from dataclasses import dataclass
from scipy.stats import spearmanr

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent.parent / "saved_models"


@dataclass
class TrainingResult:
    """Container for training results."""
    model_path: str
    train_timestamp: str
    n_samples: int
    n_features: int
    feature_columns: list[str]
    validation_metrics: dict
    residual_std: float


class ModelTrainer:
    """
    Trains and evaluates stock prediction models.

    Uses time-series cross-validation to prevent look-ahead bias:
    - Training always uses earlier dates
    - Validation always uses later dates
    """

    def __init__(self, model_dir: Path = MODEL_DIR):
        self.model_dir = model_dir
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.model: Optional[Pipeline] = None
        self.feature_columns: list[str] = []
        self.residual_std: float = 0.0
        self.last_train_timestamp: Optional[str] = None

    def _get_model(self) -> Any:
        """Get the best available regressor."""
        # Try LightGBM first
        try:
            from lightgbm import LGBMRegressor
            logger.info("Using LightGBM regressor")
            return LGBMRegressor(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.05,
                num_leaves=31,
                min_child_samples=20,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                random_state=42,
                verbose=-1,
                n_jobs=-1
            )
        except ImportError:
            pass

        # Try XGBoost
        try:
            from xgboost import XGBRegressor
            logger.info("Using XGBoost regressor")
            return XGBRegressor(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                random_state=42,
                n_jobs=-1,
                verbosity=0
            )
        except ImportError:
            pass

        # Fall back to sklearn's HistGradientBoostingRegressor
        from sklearn.ensemble import HistGradientBoostingRegressor
        logger.info("Using HistGradientBoostingRegressor")
        return HistGradientBoostingRegressor(
            max_iter=200,
            max_depth=6,
            learning_rate=0.05,
            min_samples_leaf=20,
            l2_regularization=0.1,
            random_state=42
        )

    def train(
        self,
        dataset: pd.DataFrame,
        feature_columns: list[str],
        n_splits: int = 5
    ) -> TrainingResult:
        """
        Train the model using time-series cross-validation.

        Args:
            dataset: DataFrame with features, target, and date index
            feature_columns: List of feature column names
            n_splits: Number of CV splits

        Returns:
            TrainingResult with metrics and model info
        """
        if len(dataset) == 0:
            raise ValueError("Empty dataset provided")

        self.feature_columns = feature_columns

        # Sort by date for proper time-series split
        dataset = dataset.sort_index()

        X = dataset[feature_columns].values
        y = dataset['target'].values

        logger.info(f"Training on {len(dataset)} samples with {len(feature_columns)} features")

        # Time-series cross-validation
        tscv = TimeSeriesSplit(n_splits=n_splits)

        cv_metrics = {
            'mse': [],
            'mae': [],
            'spearman_corr': [],
            'spearman_pval': []
        }
        all_residuals = []

        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]

            # Build pipeline with scaling
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('regressor', self._get_model())
            ])

            pipeline.fit(X_train, y_train)
            y_pred = pipeline.predict(X_val)

            # Compute metrics
            mse = mean_squared_error(y_val, y_pred)
            mae = mean_absolute_error(y_val, y_pred)

            # Spearman correlation (for ranking quality)
            spearman = spearmanr(y_val, y_pred)

            cv_metrics['mse'].append(mse)
            cv_metrics['mae'].append(mae)
            cv_metrics['spearman_corr'].append(spearman.statistic)
            cv_metrics['spearman_pval'].append(spearman.pvalue)

            residuals = y_val - y_pred
            all_residuals.extend(residuals)

            logger.info(
                f"Fold {fold+1}: MSE={mse:.6f}, MAE={mae:.6f}, "
                f"Spearman={spearman.statistic:.4f}"
            )

        # Final training on all data
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('regressor', self._get_model())
        ])
        self.model.fit(X, y)

        # Compute residual std for confidence estimates
        self.residual_std = float(np.std(all_residuals))

        # Aggregate validation metrics
        validation_metrics = {
            'mse_mean': float(np.mean(cv_metrics['mse'])),
            'mse_std': float(np.std(cv_metrics['mse'])),
            'mae_mean': float(np.mean(cv_metrics['mae'])),
            'mae_std': float(np.std(cv_metrics['mae'])),
            'spearman_corr_mean': float(np.mean(cv_metrics['spearman_corr'])),
            'spearman_corr_std': float(np.std(cv_metrics['spearman_corr'])),
        }

        logger.info(f"CV Results: MSE={validation_metrics['mse_mean']:.6f} +/- {validation_metrics['mse_std']:.6f}")
        logger.info(f"CV Results: Spearman={validation_metrics['spearman_corr_mean']:.4f} +/- {validation_metrics['spearman_corr_std']:.4f}")

        # Save model
        self.last_train_timestamp = datetime.now().isoformat()
        model_path = self.model_dir / "stock_predictor.joblib"

        model_data = {
            'model': self.model,
            'feature_columns': self.feature_columns,
            'residual_std': self.residual_std,
            'train_timestamp': self.last_train_timestamp,
            'validation_metrics': validation_metrics
        }
        joblib.dump(model_data, model_path)
        logger.info(f"Saved model to {model_path}")

        return TrainingResult(
            model_path=str(model_path),
            train_timestamp=self.last_train_timestamp,
            n_samples=len(dataset),
            n_features=len(feature_columns),
            feature_columns=feature_columns,
            validation_metrics=validation_metrics,
            residual_std=self.residual_std
        )

    def load_model(self) -> bool:
        """Load a previously trained model."""
        model_path = self.model_dir / "stock_predictor.joblib"

        if not model_path.exists():
            logger.warning("No saved model found")
            return False

        try:
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.feature_columns = model_data['feature_columns']
            self.residual_std = model_data['residual_std']
            self.last_train_timestamp = model_data['train_timestamp']
            logger.info(f"Loaded model from {model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False

    def predict(self, features: pd.DataFrame) -> pd.DataFrame:
        """
        Generate predictions for given features.

        Args:
            features: DataFrame with feature columns

        Returns:
            DataFrame with predictions and confidence intervals
        """
        if self.model is None:
            if not self.load_model():
                raise ValueError("No trained model available")

        # Ensure we have the right features
        missing = set(self.feature_columns) - set(features.columns)
        if missing:
            raise ValueError(f"Missing features: {missing}")

        X = features[self.feature_columns].values
        predictions = self.model.predict(X)

        result = pd.DataFrame(index=features.index)
        result['ticker'] = features['ticker'].values
        result['predicted_return'] = predictions

        # Confidence intervals (using residual std)
        result['pred_lower'] = predictions - 1.96 * self.residual_std
        result['pred_upper'] = predictions + 1.96 * self.residual_std

        return result

    def get_model_info(self) -> dict:
        """Get information about the current model."""
        if self.model is None:
            self.load_model()

        model_path = self.model_dir / "stock_predictor.joblib"

        return {
            'model_exists': self.model is not None,
            'model_path': str(model_path) if model_path.exists() else None,
            'last_train_timestamp': self.last_train_timestamp,
            'n_features': len(self.feature_columns) if self.feature_columns else 0,
            'residual_std': self.residual_std
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Test with sample data
    from ..data.prices import PriceDataManager
    from ..data.sp500 import get_sp500_tickers
    from ..features.engineering import FeatureEngineer

    # Use a small subset for testing
    tickers = get_sp500_tickers(max_tickers=20)
    manager = PriceDataManager()
    prices = manager.fetch_all_prices(tickers, years=2)
    spy = manager.fetch_spy(years=2)

    engineer = FeatureEngineer()
    dataset = engineer.create_training_dataset(prices, spy)

    trainer = ModelTrainer()
    result = trainer.train(dataset, engineer.get_feature_columns())

    print(f"\nTraining complete!")
    print(f"Samples: {result.n_samples}")
    print(f"Features: {result.n_features}")
    print(f"Validation MSE: {result.validation_metrics['mse_mean']:.6f}")
    print(f"Validation Spearman: {result.validation_metrics['spearman_corr_mean']:.4f}")

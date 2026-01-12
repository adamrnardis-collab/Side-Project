"""
Stock Predictor API

A FastAPI application for predicting S&P 500 stock returns.

DISCLAIMER: This is a research tool, NOT financial advice.
Do not use for actual trading decisions.
"""

import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Stock Predictor MVP",
    description="""
    ## S&P 500 Stock Return Predictor

    This research tool predicts 3-day forward returns for S&P 500 stocks
    using machine learning on historical price and technical features.

    ### DISCLAIMER

    **This is NOT financial advice.** This tool is for educational and
    research purposes only. Do not use predictions for actual trading decisions.
    Past performance does not guarantee future results.

    ### How It Works

    1. **Data**: Fetches daily OHLCV data from yfinance
    2. **Features**: Computes technical indicators (returns, volatility, momentum, RSI, MACD, etc.)
    3. **Model**: Trains a gradient boosting model with time-series cross-validation
    4. **Predictions**: Ranks stocks by predicted 3-day forward return

    ### Avoiding Look-Ahead Bias

    - All features at date t use only data available at or before t
    - Training uses time-series split (train on past, validate on future)
    - Forward returns are computed correctly without leakage
    """,
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Serve static files
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    """Serve the main HTML page."""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "message": "Stock Predictor API",
        "docs": "/docs",
        "disclaimer": "This is NOT financial advice. For research purposes only."
    }


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    logger.info("Stock Predictor API starting up...")
    logger.info("DISCLAIMER: This is a research tool, NOT financial advice.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

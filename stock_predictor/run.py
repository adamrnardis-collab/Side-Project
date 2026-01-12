#!/usr/bin/env python3
"""
Run script for Stock Predictor MVP.

Usage:
    python run.py              # Start the web server
    python run.py --quick-test # Run a quick test with 20 stocks
"""

import argparse
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def run_server(host: str = "0.0.0.0", port: int = 8000):
    """Start the FastAPI server."""
    import uvicorn
    print(f"\n{'='*60}")
    print("  STOCK PREDICTOR MVP")
    print("  DISCLAIMER: This is NOT financial advice!")
    print(f"{'='*60}\n")
    print(f"Starting server at http://{host}:{port}")
    print(f"API docs at http://{host}:{port}/docs\n")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)


def run_quick_test():
    """Run a quick test to verify everything works."""
    print("\n" + "="*60)
    print("  STOCK PREDICTOR - QUICK TEST")
    print("  DISCLAIMER: This is NOT financial advice!")
    print("="*60 + "\n")

    from app.data.sp500 import get_sp500_tickers
    from app.data.prices import PriceDataManager
    from app.features.engineering import FeatureEngineer
    from app.models.trainer import ModelTrainer

    # Step 1: Get tickers
    print("[1/4] Fetching S&P 500 tickers...")
    tickers = get_sp500_tickers(max_tickers=20)
    print(f"      Got {len(tickers)} tickers: {tickers[:5]}...\n")

    # Step 2: Fetch prices
    print("[2/4] Fetching price data (this may take a minute)...")
    manager = PriceDataManager()
    prices = manager.fetch_all_prices(tickers, years=2)
    spy = manager.fetch_spy(years=2)
    print(f"      Loaded {len(prices)} tickers\n")

    # Step 3: Create features and train
    print("[3/4] Creating features and training model...")
    engineer = FeatureEngineer()
    dataset = engineer.create_training_dataset(prices, spy)
    print(f"      Dataset: {len(dataset)} samples, {len(engineer.get_feature_columns())} features")

    trainer = ModelTrainer()
    result = trainer.train(dataset, engineer.get_feature_columns())
    print(f"      MSE: {result.validation_metrics['mse_mean']:.6f}")
    print(f"      Spearman: {result.validation_metrics['spearman_corr_mean']:.4f}\n")

    # Step 4: Generate predictions
    print("[4/4] Generating predictions...")
    pred_features = engineer.create_prediction_features(prices, spy)
    predictions = trainer.predict(pred_features)
    predictions = predictions.sort_values('predicted_return', ascending=False)

    print("\n" + "="*60)
    print("  TOP 5 PREDICTED RETURNS (Next 3 Days)")
    print("="*60)
    for i, (_, row) in enumerate(predictions.head(5).iterrows()):
        print(f"  {i+1}. {row['ticker']:6s}  {row['predicted_return']*100:+.2f}%")

    print("\n" + "="*60)
    print("  BOTTOM 5 PREDICTED RETURNS (Next 3 Days)")
    print("="*60)
    for i, (_, row) in enumerate(predictions.tail(5).iloc[::-1].iterrows()):
        print(f"  {i+1}. {row['ticker']:6s}  {row['predicted_return']*100:+.2f}%")

    print("\n" + "="*60)
    print("  REMINDER: This is NOT financial advice!")
    print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Stock Predictor MVP")
    parser.add_argument(
        "--quick-test",
        action="store_true",
        help="Run a quick test with 20 stocks"
    )
    parser.add_argument(
        "--host",
        default="0.0.0.0",
        help="Server host (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Server port (default: 8000)"
    )

    args = parser.parse_args()

    if args.quick_test:
        run_quick_test()
    else:
        run_server(args.host, args.port)


if __name__ == "__main__":
    main()

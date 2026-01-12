"""
Price Data Manager

Fetches and caches OHLCV data from yfinance.
"""

import pandas as pd
import numpy as np
import yfinance as yf
import logging
from pathlib import Path
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional
import json

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "prices"
METADATA_FILE = CACHE_DIR / "metadata.json"


class PriceDataManager:
    """Manages price data fetching and caching."""

    def __init__(self, cache_dir: Path = CACHE_DIR):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._metadata = self._load_metadata()

    def _load_metadata(self) -> dict:
        """Load metadata about cached files."""
        if METADATA_FILE.exists():
            try:
                with open(METADATA_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"last_update": None, "tickers_updated": []}

    def _save_metadata(self):
        """Save metadata."""
        try:
            with open(METADATA_FILE, "w") as f:
                json.dump(self._metadata, f)
        except Exception as e:
            logger.warning(f"Failed to save metadata: {e}")

    def get_last_update(self) -> Optional[str]:
        """Get timestamp of last data update."""
        return self._metadata.get("last_update")

    def fetch_all_prices(
        self,
        tickers: list[str],
        years: int = 5,
        max_workers: int = 10,
        force_refresh: bool = False
    ) -> dict[str, pd.DataFrame]:
        """
        Fetch price data for all tickers.

        Args:
            tickers: List of ticker symbols
            years: Number of years of history to fetch
            max_workers: Number of parallel download threads
            force_refresh: Force re-download even if cached

        Returns:
            Dictionary mapping ticker to DataFrame with OHLCV data
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)

        results = {}
        failed = []
        to_fetch = []

        # Check which tickers need fetching
        for ticker in tickers:
            cache_file = self.cache_dir / f"{ticker}.parquet"

            if not force_refresh and cache_file.exists():
                try:
                    df = pd.read_parquet(cache_file)
                    # Check if we need to update (data is more than 1 day old)
                    if len(df) > 0:
                        last_date = df.index.max()
                        if isinstance(last_date, pd.Timestamp):
                            if (datetime.now() - last_date.to_pydatetime()).days <= 1:
                                results[ticker] = df
                                continue
                except Exception as e:
                    logger.warning(f"Failed to load cache for {ticker}: {e}")

            to_fetch.append(ticker)

        logger.info(f"Fetching {len(to_fetch)} tickers, {len(results)} from cache")

        # Fetch remaining tickers in parallel
        if to_fetch:
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                future_to_ticker = {
                    executor.submit(
                        self._fetch_single_ticker,
                        ticker,
                        start_date,
                        end_date
                    ): ticker
                    for ticker in to_fetch
                }

                for future in as_completed(future_to_ticker):
                    ticker = future_to_ticker[future]
                    try:
                        df = future.result()
                        if df is not None and len(df) > 0:
                            results[ticker] = df
                            # Cache to parquet
                            cache_file = self.cache_dir / f"{ticker}.parquet"
                            df.to_parquet(cache_file)
                        else:
                            failed.append(ticker)
                    except Exception as e:
                        logger.warning(f"Failed to fetch {ticker}: {e}")
                        failed.append(ticker)

        # Update metadata
        self._metadata["last_update"] = datetime.now().isoformat()
        self._metadata["tickers_updated"] = list(results.keys())
        self._save_metadata()

        logger.info(f"Successfully loaded {len(results)} tickers, {len(failed)} failed")
        if failed:
            logger.debug(f"Failed tickers: {failed[:20]}...")

        return results

    def _fetch_single_ticker(
        self,
        ticker: str,
        start_date: datetime,
        end_date: datetime
    ) -> Optional[pd.DataFrame]:
        """Fetch data for a single ticker."""
        try:
            stock = yf.Ticker(ticker)
            df = stock.history(start=start_date, end=end_date, auto_adjust=True)

            if df.empty:
                logger.warning(f"No data for {ticker}")
                return None

            # Ensure we have the required columns
            required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
            if not all(col in df.columns for col in required_cols):
                logger.warning(f"Missing columns for {ticker}")
                return None

            # Keep only required columns
            df = df[required_cols].copy()

            # Remove timezone info from index if present
            if df.index.tz is not None:
                df.index = df.index.tz_localize(None)

            # Clean data
            df = df.dropna()

            return df

        except Exception as e:
            logger.warning(f"Error fetching {ticker}: {e}")
            return None

    def load_cached_prices(self, tickers: list[str]) -> dict[str, pd.DataFrame]:
        """Load prices from cache only (no network calls)."""
        results = {}
        for ticker in tickers:
            cache_file = self.cache_dir / f"{ticker}.parquet"
            if cache_file.exists():
                try:
                    df = pd.read_parquet(cache_file)
                    if len(df) > 0:
                        results[ticker] = df
                except Exception as e:
                    logger.warning(f"Failed to load cache for {ticker}: {e}")
        return results

    def fetch_spy(self, years: int = 5) -> pd.DataFrame:
        """Fetch SPY data for market features."""
        cache_file = self.cache_dir / "SPY.parquet"

        # Check cache
        if cache_file.exists():
            try:
                df = pd.read_parquet(cache_file)
                if len(df) > 0:
                    last_date = df.index.max()
                    if isinstance(last_date, pd.Timestamp):
                        if (datetime.now() - last_date.to_pydatetime()).days <= 1:
                            return df
            except Exception:
                pass

        # Fetch fresh
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)

        df = self._fetch_single_ticker("SPY", start_date, end_date)
        if df is not None:
            df.to_parquet(cache_file)
            return df

        return pd.DataFrame()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    manager = PriceDataManager()

    # Test with a few tickers
    test_tickers = ["AAPL", "MSFT", "GOOGL"]
    prices = manager.fetch_all_prices(test_tickers, years=1)

    for ticker, df in prices.items():
        print(f"{ticker}: {len(df)} rows, {df.index.min()} to {df.index.max()}")

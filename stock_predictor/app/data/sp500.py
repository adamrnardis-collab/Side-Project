"""
S&P 500 Constituents Fetcher

Fetches the list of S&P 500 tickers from Wikipedia.
"""

import pandas as pd
import logging
from pathlib import Path
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

# Cache file for S&P 500 tickers
CACHE_DIR = Path(__file__).parent.parent.parent / "data"
TICKER_CACHE_FILE = CACHE_DIR / "sp500_tickers.json"
CACHE_EXPIRY_DAYS = 7


def get_sp500_tickers(use_cache: bool = True, max_tickers: int | None = None) -> list[str]:
    """
    Fetch S&P 500 tickers from Wikipedia.

    Args:
        use_cache: Whether to use cached tickers if available
        max_tickers: Limit number of tickers (for testing)

    Returns:
        List of ticker symbols
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Check cache
    if use_cache and TICKER_CACHE_FILE.exists():
        try:
            with open(TICKER_CACHE_FILE, "r") as f:
                cache_data = json.load(f)

            cached_time = datetime.fromisoformat(cache_data["timestamp"])
            if datetime.now() - cached_time < timedelta(days=CACHE_EXPIRY_DAYS):
                tickers = cache_data["tickers"]
                logger.info(f"Loaded {len(tickers)} tickers from cache")
                if max_tickers:
                    return tickers[:max_tickers]
                return tickers
        except Exception as e:
            logger.warning(f"Failed to load ticker cache: {e}")

    # Fetch from Wikipedia
    tickers = _fetch_from_wikipedia()

    # Save to cache
    try:
        cache_data = {
            "timestamp": datetime.now().isoformat(),
            "tickers": tickers
        }
        with open(TICKER_CACHE_FILE, "w") as f:
            json.dump(cache_data, f)
        logger.info(f"Cached {len(tickers)} tickers")
    except Exception as e:
        logger.warning(f"Failed to save ticker cache: {e}")

    if max_tickers:
        return tickers[:max_tickers]
    return tickers


def _fetch_from_wikipedia() -> list[str]:
    """Fetch S&P 500 tickers from Wikipedia."""
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"

    try:
        tables = pd.read_html(url)
        df = tables[0]

        # The ticker column is usually named 'Symbol'
        if 'Symbol' in df.columns:
            tickers = df['Symbol'].tolist()
        elif 'Ticker' in df.columns:
            tickers = df['Ticker'].tolist()
        else:
            # Try first column
            tickers = df.iloc[:, 0].tolist()

        # Clean tickers (remove periods, handle special characters)
        cleaned_tickers = []
        for ticker in tickers:
            if isinstance(ticker, str):
                # Replace . with - for compatibility with yfinance (e.g., BRK.B -> BRK-B)
                cleaned = ticker.replace(".", "-").strip()
                if cleaned:
                    cleaned_tickers.append(cleaned)

        logger.info(f"Fetched {len(cleaned_tickers)} S&P 500 tickers from Wikipedia")
        return cleaned_tickers

    except Exception as e:
        logger.error(f"Failed to fetch S&P 500 tickers from Wikipedia: {e}")
        # Return a fallback list of major tickers
        return _get_fallback_tickers()


def _get_fallback_tickers() -> list[str]:
    """Fallback list of major S&P 500 tickers."""
    return [
        "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "META", "TSLA", "BRK-B",
        "UNH", "XOM", "JNJ", "JPM", "V", "PG", "MA", "HD", "CVX", "MRK",
        "LLY", "ABBV", "PEP", "KO", "COST", "AVGO", "WMT", "MCD", "CSCO",
        "TMO", "ACN", "ABT", "DHR", "NEE", "VZ", "ADBE", "CMCSA", "NKE",
        "PM", "TXN", "WFC", "BMY", "COP", "RTX", "UPS", "HON", "QCOM",
        "LOW", "UNP", "ORCL", "INTC", "AMD"
    ]


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    tickers = get_sp500_tickers()
    print(f"Got {len(tickers)} tickers")
    print(f"First 10: {tickers[:10]}")

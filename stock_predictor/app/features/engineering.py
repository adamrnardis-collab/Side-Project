"""
Feature Engineering Module

Creates features for stock prediction using ONLY past data.
Critical: All features at date t must use only data available at or before t.
"""

import pandas as pd
import numpy as np
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Forward return horizon (trading days)
FORWARD_DAYS = 3


class FeatureEngineer:
    """
    Feature engineering for stock prediction.

    IMPORTANT: This class is designed to prevent look-ahead bias.
    - All features at date t use only data from dates <= t
    - The target variable y(t) uses future data (t+1 to t+FORWARD_DAYS)
      and rows with missing targets are explicitly dropped during training
    """

    def __init__(self, forward_days: int = FORWARD_DAYS):
        self.forward_days = forward_days
        self.feature_columns: list[str] = []

    def compute_features(
        self,
        df: pd.DataFrame,
        ticker: str,
        spy_df: Optional[pd.DataFrame] = None,
        include_target: bool = True
    ) -> pd.DataFrame:
        """
        Compute features for a single ticker.

        Args:
            df: OHLCV DataFrame with DatetimeIndex
            ticker: Ticker symbol
            spy_df: Optional SPY data for market features
            include_target: Whether to compute target variable

        Returns:
            DataFrame with features (and optionally target)
        """
        if len(df) < 250:  # Need at least ~1 year of data
            logger.warning(f"Insufficient data for {ticker}: {len(df)} rows")
            return pd.DataFrame()

        df = df.copy()
        df = df.sort_index()

        # Ensure numeric types
        for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        features = pd.DataFrame(index=df.index)
        features['ticker'] = ticker

        # =========================================
        # RETURN FEATURES (using log returns)
        # =========================================
        close = df['Close']
        log_close = np.log(close)

        # Historical returns (at date t, we know Close(t))
        features['ret_1d'] = log_close.diff(1)
        features['ret_3d'] = log_close.diff(3)
        features['ret_5d'] = log_close.diff(5)
        features['ret_10d'] = log_close.diff(10)
        features['ret_20d'] = log_close.diff(20)

        # =========================================
        # VOLATILITY FEATURES
        # =========================================
        daily_ret = log_close.diff(1)
        features['vol_5d'] = daily_ret.rolling(5).std()
        features['vol_10d'] = daily_ret.rolling(10).std()
        features['vol_20d'] = daily_ret.rolling(20).std()

        # =========================================
        # MOMENTUM FEATURES (rolling mean returns)
        # =========================================
        features['mom_5d'] = daily_ret.rolling(5).mean()
        features['mom_10d'] = daily_ret.rolling(10).mean()
        features['mom_20d'] = daily_ret.rolling(20).mean()

        # =========================================
        # RSI (14-period)
        # =========================================
        features['rsi_14'] = self._compute_rsi(close, 14)

        # =========================================
        # MACD (12, 26, 9)
        # =========================================
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=9, adjust=False).mean()
        macd_hist = macd_line - signal_line

        # Normalize MACD by price for comparability across stocks
        features['macd_line'] = macd_line / close
        features['macd_signal'] = signal_line / close
        features['macd_hist'] = macd_hist / close

        # =========================================
        # DISTANCE TO MOVING AVERAGES
        # =========================================
        ma20 = close.rolling(20).mean()
        ma50 = close.rolling(50).mean()
        ma200 = close.rolling(200).mean()

        features['dist_ma20'] = (close / ma20) - 1
        features['dist_ma50'] = (close / ma50) - 1
        features['dist_ma200'] = (close / ma200) - 1

        # =========================================
        # VOLUME FEATURES
        # =========================================
        volume = df['Volume'].replace(0, np.nan)
        features['vol_pct_change'] = volume.pct_change()

        # Volume z-score (20-day)
        vol_mean = volume.rolling(20).mean()
        vol_std = volume.rolling(20).std()
        features['vol_zscore_20'] = (volume - vol_mean) / vol_std

        # =========================================
        # PRICE RANGE FEATURES
        # =========================================
        high = df['High']
        low = df['Low']

        # True Range (normalized)
        tr = pd.concat([
            high - low,
            abs(high - close.shift(1)),
            abs(low - close.shift(1))
        ], axis=1).max(axis=1)
        features['atr_14'] = tr.rolling(14).mean() / close

        # Daily range
        features['daily_range'] = (high - low) / close

        # =========================================
        # MARKET FEATURES (SPY)
        # =========================================
        if spy_df is not None and len(spy_df) > 0:
            spy_features = self._compute_market_features(spy_df, features.index)
            for col in spy_features.columns:
                features[f'mkt_{col}'] = spy_features[col]

        # =========================================
        # TARGET VARIABLE (forward return)
        # =========================================
        if include_target:
            # y(t) = (Close(t+forward_days) / Close(t)) - 1
            # This is the return from Close(t) to Close(t+forward_days)
            # CRITICAL: shift(-forward_days) means we're looking forward
            future_close = close.shift(-self.forward_days)
            features['target'] = (future_close / close) - 1

            # Rows where target is NaN are at the end of the series
            # These will be dropped during training but kept for prediction

        # Store feature column names (excluding ticker and target)
        self.feature_columns = [
            col for col in features.columns
            if col not in ['ticker', 'target']
        ]

        return features

    def _compute_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Compute RSI indicator."""
        delta = prices.diff()
        gain = delta.where(delta > 0, 0.0)
        loss = (-delta).where(delta < 0, 0.0)

        avg_gain = gain.ewm(span=period, adjust=False).mean()
        avg_loss = loss.ewm(span=period, adjust=False).mean()

        rs = avg_gain / avg_loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + rs))

        return rsi

    def _compute_market_features(
        self,
        spy_df: pd.DataFrame,
        target_index: pd.DatetimeIndex
    ) -> pd.DataFrame:
        """Compute market (SPY) features aligned to target index."""
        spy_df = spy_df.copy()
        close = spy_df['Close']
        log_close = np.log(close)

        mkt = pd.DataFrame(index=spy_df.index)

        # Returns
        mkt['ret_1d'] = log_close.diff(1)
        mkt['ret_5d'] = log_close.diff(5)
        mkt['ret_20d'] = log_close.diff(20)

        # Volatility
        daily_ret = log_close.diff(1)
        mkt['vol_20d'] = daily_ret.rolling(20).std()

        # Momentum
        mkt['mom_20d'] = daily_ret.rolling(20).mean()

        # RSI
        mkt['rsi_14'] = self._compute_rsi(close, 14)

        # Align to target index
        mkt = mkt.reindex(target_index, method='ffill')

        return mkt

    def create_training_dataset(
        self,
        price_data: dict[str, pd.DataFrame],
        spy_df: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """
        Create a pooled training dataset from all tickers.

        Args:
            price_data: Dictionary mapping ticker to OHLCV DataFrame
            spy_df: Optional SPY data for market features

        Returns:
            DataFrame with all features, ticker column, and target
        """
        all_features = []

        for ticker, df in price_data.items():
            try:
                features = self.compute_features(
                    df, ticker, spy_df, include_target=True
                )
                if len(features) > 0:
                    all_features.append(features)
            except Exception as e:
                logger.warning(f"Failed to compute features for {ticker}: {e}")

        if not all_features:
            return pd.DataFrame()

        combined = pd.concat(all_features, axis=0)

        # Drop rows with NaN features or target
        # (target is NaN for the last forward_days rows of each ticker)
        combined = combined.dropna(subset=['target'])
        combined = combined.dropna(subset=self.feature_columns)

        logger.info(f"Created dataset with {len(combined)} rows from {len(price_data)} tickers")

        return combined

    def create_prediction_features(
        self,
        price_data: dict[str, pd.DataFrame],
        spy_df: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """
        Create features for prediction (most recent date only).

        Args:
            price_data: Dictionary mapping ticker to OHLCV DataFrame
            spy_df: Optional SPY data for market features

        Returns:
            DataFrame with features for the latest date per ticker
        """
        latest_features = []

        for ticker, df in price_data.items():
            try:
                features = self.compute_features(
                    df, ticker, spy_df, include_target=False
                )
                if len(features) > 0:
                    # Get the most recent row with valid features
                    valid_features = features.dropna(subset=self.feature_columns)
                    if len(valid_features) > 0:
                        latest = valid_features.iloc[[-1]].copy()
                        latest_features.append(latest)
            except Exception as e:
                logger.warning(f"Failed to compute prediction features for {ticker}: {e}")

        if not latest_features:
            return pd.DataFrame()

        combined = pd.concat(latest_features, axis=0)
        return combined

    def get_feature_columns(self) -> list[str]:
        """Get list of feature column names."""
        return self.feature_columns


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Test with sample data
    from ..data.prices import PriceDataManager

    manager = PriceDataManager()
    prices = manager.fetch_all_prices(["AAPL", "MSFT"], years=2)
    spy = manager.fetch_spy(years=2)

    engineer = FeatureEngineer()
    dataset = engineer.create_training_dataset(prices, spy)

    print(f"Dataset shape: {dataset.shape}")
    print(f"Feature columns: {engineer.get_feature_columns()}")
    print(f"Target stats:\n{dataset['target'].describe()}")

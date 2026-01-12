# Stock Predictor MVP

A machine learning tool that predicts 3-day forward returns for S&P 500 stocks using technical features.

---

## DISCLAIMER

**THIS IS NOT FINANCIAL ADVICE.**

This project is a **research and educational tool only**. It is intended to demonstrate:
- How to build ML pipelines for time-series prediction
- Proper handling of look-ahead bias
- Feature engineering for financial data

**Do NOT use this tool for actual trading or investment decisions.**

- Past performance does not guarantee future results
- Stock price prediction is extremely difficult and unreliable
- This model has not been validated for real-world trading
- You could lose money if you trade based on these predictions

---

## How It Works

### Data Pipeline
1. **Ticker Fetching**: Scrapes S&P 500 constituents from Wikipedia
2. **Price Data**: Downloads daily OHLCV data from yfinance
3. **Caching**: Stores data locally in parquet format for speed

### Feature Engineering
For each stock and date, we compute technical features using **only past data**:

| Feature Category | Features |
|-----------------|----------|
| Returns | 1d, 3d, 5d, 10d, 20d log returns |
| Volatility | 5d, 10d, 20d rolling std of returns |
| Momentum | 5d, 10d, 20d rolling mean returns |
| RSI | 14-period RSI |
| MACD | Line, Signal, Histogram (normalized) |
| Moving Averages | Distance to MA20, MA50, MA200 |
| Volume | Pct change, 20d z-score |
| Range | ATR(14), daily range |
| Market | SPY features as exogenous variables |

### Target Variable
```
y(t) = (Close(t+3) / Close(t)) - 1
```
This is the cumulative return from close on day t to close on day t+3.

### Model
- **Default**: LightGBM (if installed), otherwise HistGradientBoostingRegressor
- **Validation**: Time-series cross-validation (train on past, validate on future)
- **Metrics**: MSE, MAE, Spearman rank correlation

---

## Avoiding Look-Ahead Bias

This project takes several measures to prevent data leakage:

### 1. Feature Computation
All features at date t use only data available at or before date t:
- Rolling statistics use only past windows
- Returns are computed as `Close(t) / Close(t-n) - 1`, not forward-looking

### 2. Target Alignment
The target `y(t)` represents the return from t to t+3. When training:
- We compute `future_close = close.shift(-3)` to get the t+3 price
- Rows where the target is NaN (last 3 days of data) are dropped
- Features at t never include any information from t+1, t+2, or t+3

### 3. Time-Series Cross-Validation
Training uses `TimeSeriesSplit`:
- Each fold trains on earlier dates and validates on later dates
- No shuffling of data
- Ensures the model never sees future data during training

### 4. Prediction Time
When generating predictions:
- We use only the most recent row of features per ticker
- These features use only historical data
- The prediction is for the next 3 trading days (future)

---

## Project Structure

```
stock_predictor/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py        # API endpoints
│   ├── data/
│   │   ├── __init__.py
│   │   ├── sp500.py         # S&P 500 ticker fetching
│   │   └── prices.py        # Price data management
│   ├── features/
│   │   ├── __init__.py
│   │   └── engineering.py   # Feature engineering
│   └── models/
│       ├── __init__.py
│       └── trainer.py       # Model training
├── static/
│   └── index.html           # Web UI
├── data/                    # Cached price data (created at runtime)
├── saved_models/            # Trained model artifacts (created at runtime)
├── requirements.txt
└── README.md
```

---

## Installation

### Prerequisites
- Python 3.10+
- pip

### Setup

```bash
# Navigate to the project
cd stock_predictor

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Optional: Install LightGBM for better performance
pip install lightgbm
```

---

## Running the Application

### Start the Server

```bash
cd stock_predictor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access the UI

Open http://localhost:8000 in your browser.

### API Documentation

FastAPI auto-generates docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Usage

### Web UI Workflow

1. **Update Data**: Click to fetch/refresh price data for all S&P 500 stocks
   - First run may take 10-15 minutes for all ~500 stocks
   - Use "Quick Test Mode" dropdown to limit to fewer stocks

2. **Train Model**: Click to train the prediction model
   - Uses time-series cross-validation
   - Displays MSE and Spearman correlation metrics

3. **Generate Picks**: Click to generate predictions
   - Shows Top 5 (predicted to go up)
   - Shows Bottom 5 (predicted to go down)
   - Includes 95% confidence intervals

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get system status |
| `/api/update-data` | POST | Fetch/update price data |
| `/api/train` | POST | Train the prediction model |
| `/api/predictions` | GET | Generate stock predictions |
| `/api/health` | GET | Health check |

### Quick Test Mode

For faster iteration, limit the number of stocks:

**Web UI**: Use the dropdown before clicking buttons

**API**:
```bash
# Update data for 50 stocks only
curl -X POST http://localhost:8000/api/update-data \
  -H "Content-Type: application/json" \
  -d '{"max_tickers": 50, "years": 2}'

# Train on 50 stocks
curl -X POST http://localhost:8000/api/train \
  -H "Content-Type: application/json" \
  -d '{"max_tickers": 50}'
```

---

## Known Limitations

### Data Quality
- yfinance data may have gaps or errors
- Some tickers may fail to download (delisted, renamed, etc.)
- Weekend/holiday handling uses trading days from data

### Model Limitations
- Simple feature set (no fundamental data, sentiment, etc.)
- Global model (same model for all stocks)
- No sector/industry-specific modeling
- No portfolio optimization or risk management
- Basic hyperparameters (not extensively tuned)

### Prediction Accuracy
- Stock prediction is inherently difficult
- Spearman correlation ~0.02-0.05 is typical (slightly better than random)
- High residual variance means wide confidence intervals
- Model may not generalize to market regime changes

### Performance
- Initial data download takes time (~500 API calls)
- Training on full dataset requires RAM for ~500k+ rows
- Caching helps subsequent runs

---

## Validation Metrics

The model reports:

- **MSE (Mean Squared Error)**: How close predictions are to actual returns
- **MAE (Mean Absolute Error)**: Average absolute prediction error
- **Spearman Correlation**: Ranking quality (are higher predictions actually higher returns?)
- **Residual Std**: Standard deviation of prediction errors (used for confidence intervals)

A Spearman correlation > 0 suggests the model has some predictive power for ranking stocks, even if absolute return predictions are noisy.

---

## Extending the Project

### Add More Features
Edit `app/features/engineering.py`:
- Add fundamental data (P/E, earnings, etc.)
- Add sentiment features
- Add cross-sectional features (sector momentum, etc.)

### Use Different Models
Edit `app/models/trainer.py`:
- Try neural networks
- Try ensemble methods
- Add hyperparameter tuning

### Add Backtesting
- Implement walk-forward backtesting
- Track simulated PnL
- Add transaction costs

---

## License

This project is provided as-is for educational purposes.

---

## Acknowledgments

- [yfinance](https://github.com/ranaroussi/yfinance) for market data
- [scikit-learn](https://scikit-learn.org/) for ML infrastructure
- [FastAPI](https://fastapi.tiangolo.com/) for the web framework
- [LightGBM](https://lightgbm.readthedocs.io/) for gradient boosting

import random
import string
import uuid
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, db
from faker import Faker

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://isph-stock-exchange-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# Faker instance
faker = Faker()

# References to database tables
stocks_ref = db.reference("stocks")
price_history_ref = db.reference("price_history")

# Generate fake stocks
def generate_stocks_with_price_history(num_stocks=5):
    for _ in range(num_stocks):
        stock_ticker = ''.join(random.choices(string.ascii_uppercase, k=3))
        total_volume = random.randint(1000, 100000)
        volume_available = random.randint(100, total_volume)
        stock_data = {
            "stock_name": faker.company(),
            "full_name": faker.company_suffix(),
            "current_price": round(random.uniform(10, 200), 2),
            "total_volume": total_volume,
            "volume_available": volume_available,
            "market_cap": random.randint(1000000, 1000000000),
        }
        print(f"Generating stock data for {stock_ticker}...")
        print(stock_data)
        stocks_ref.child(stock_ticker).set(stock_data)
        print(f"Generating price history for {stock_ticker}...")
        generate_price_history_over_time(stock_ticker)

# Generate stock price history over 30 days with 5-minute intervals
def generate_price_history_over_time(stock_ticker, days=5, interval_minutes=5):
    start_time = datetime.now() - timedelta(days=days)
    end_time = datetime.now()
    base_price = round(random.uniform(10, 200), 2)
    
    current_time = start_time
    while current_time <= end_time:
        price_history_id = str(uuid.uuid4())
        price_data = {
            "stock_ticker": stock_ticker,
            "price": round(base_price * random.uniform(0.95, 1.05), 2),
            "timestamp": current_time.isoformat(),
        }
        price_history_ref.child(price_history_id).set(price_data)
        print(f"Generated price data for {stock_ticker} at {current_time.isoformat()} with price {price_data['price']}")
        current_time += timedelta(minutes=interval_minutes)

if __name__ == "__main__":
    print("Generating stocks with detailed price history...")
    generate_stocks_with_price_history()
    print("Stock data generation completed!")

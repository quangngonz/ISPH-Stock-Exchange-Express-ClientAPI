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
users_ref = db.reference("users")
stocks_ref = db.reference("stocks")
portfolios_ref = db.reference("portfolios")
transactions_ref = db.reference("transactions")

# Generate fake users
def generate_users(num_users=10):
    for _ in range(num_users):
        user_id = str(uuid.uuid4())
        user_data = {
            "username": faker.user_name(),
            "house": random.choice(["Rua Bien", "Voi", "Te Giac", "Ho"]),
            "points_balance": random.randint(100, 1000),
        }
        users_ref.child(user_id).set(user_data)

# Generate fake stocks
def generate_stocks(num_stocks=5):
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
        stocks_ref.child(stock_ticker).set(stock_data)

# Generate stock price history
def generate_price_history(stock_ticker, days=7):
    price_history_ref = db.reference("price_history")
    base_price = round(random.uniform(10, 200), 2)
    for i in range(days):
        price_history_id = str(uuid.uuid4())
        price_data = {
            "stock_ticker": stock_ticker,
            "price": round(base_price * random.uniform(0.95, 1.05), 2),
            "timestamp": (datetime.now() - timedelta(days=i)).isoformat(),
        }
        price_history_ref.child(price_history_id).set(price_data)

# Generate fake portfolios
def generate_portfolios():
    users = users_ref.get()
    stocks = stocks_ref.get()
    if not users or not stocks:
        return

    for user_id in users.keys():
        portfolio_id = str(uuid.uuid4())
        portfolios_ref.child(portfolio_id).set({"user_id": user_id, "points_balance": users[user_id]["points_balance"]})

        portfolio_items_ref = portfolios_ref.child(portfolio_id).child("items")
        for stock_ticker in random.sample(list(stocks.keys()), k=random.randint(1, 3)):
            portfolio_items_ref.child(stock_ticker).set({"quantity": random.randint(1, 50)})

# Helper function to generate a random timestamp within the last 3 months
def random_date_within_last_3_months():
    today = datetime.now()
    start_date = today - timedelta(days=90)  # Approximate 3 months
    random_days = random.randint(0, 90)  # Random number of days within 3 months
    random_seconds = random.randint(0, 86400)  # Random number of seconds within a day
    return (start_date + timedelta(days=random_days, seconds=random_seconds)).isoformat()

# Generate fake transactions
def generate_transactions(num_transactions=20):
    users = users_ref.get()
    stocks = stocks_ref.get()
    if not users or not stocks:
        return

    for _ in range(num_transactions):
        user_id = random.choice(list(users.keys()))
        stock_ticker = random.choice(list(stocks.keys()))
        transaction_data = {
            "user_id": user_id,
            "stock_ticker": stock_ticker,
            "quantity": random.randint(1, 10),
            "transaction_type": random.choice(["buy", "sell"]),
            "timestamp": random_date_within_last_3_months(),  # Use random date generator
        }
        transaction_id = str(uuid.uuid4())
        transactions_ref.child(transaction_id).set(transaction_data)

# if __name__ == "__main__":
#     print("Generating fake data...")
#     generate_users()
#     generate_stocks()
#     stocks = stocks_ref.get()
#     if stocks:
#         for ticker in stocks.keys():
#             generate_price_history(ticker)
#     generate_portfolios()
#     generate_transactions()
#     print("Fake data generation completed!")


stocks = stocks_ref.get()
user_id = "QHrWvCXzryfIPze5dUzyVVOES4f1"

portfolios_ref.child(user_id).set({ "points_balance": 500})

portfolio_items_ref = portfolios_ref.child(user_id).child("items")
for stock_ticker in random.sample(list(stocks.keys()), k=4):
    portfolio_items_ref.child(stock_ticker).set({"quantity": random.randint(1, 50)})

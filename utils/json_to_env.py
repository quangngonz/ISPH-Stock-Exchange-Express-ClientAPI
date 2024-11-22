import json
import os

def json_to_env(json_file, env_file=".env"):
    """
    Reads a Firebase service account JSON file and appends its contents
    as environment variables to a .env file.
    
    :param json_file: Path to the JSON file.
    :param env_file: Path to the .env file (default: ".env").
    """
    try:
        # Load the JSON file
        with open(json_file, 'r') as f:
            data = json.load(f)

        # Prepare key-value pairs for .env format
        env_lines = []
        for key, value in data.items():
            # Escape newlines in values (e.g., private keys)
            if isinstance(value, str):
                value = value.replace('\n', '\\n')
            env_lines.append(f"FIREBASE_{key.upper()}={value}")

        # Append to the .env file
        with open(env_file, 'a') as f:
            f.write("\n" + "\n".join(env_lines))

        print(f"Environment variables have been appended to {env_file}.")
    except FileNotFoundError:
        print(f"Error: {json_file} not found.")
    except json.JSONDecodeError:
        print("Error: Failed to parse JSON. Please check the file format.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # Input JSON file path
    json_path = input("Enter the path to the Firebase service account JSON file: ").strip()
    # Optional: Specify .env file path
    env_path = input("Enter the path to the .env file (default: .env): ").strip() or ".env"
    
    json_to_env(json_path, env_path)

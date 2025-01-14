from dotenv import dotenv_values
import subprocess

def set_heroku_config(env_file="../.env", app_name=None):
    # Load the environment variables from the .env file
    env_vars = dotenv_values(env_file)

    # Check if app name is provided
    if not app_name:
        print("Error: Heroku app name is required.")
        return
    
    # Iterate through the environment variables and set them in Heroku
    for key, value in env_vars.items():
        if value is None:  # Skip variables without values
            continue
        
        try:
            # Run heroku config:set command
            command = f"heroku config:set {key}='{value}' --app {app_name}"
            result = subprocess.run(command, shell=True, text=True, capture_output=True)
            
            if result.returncode == 0:
                print(f"Successfully set {key}")
            else:
                print(f"Error setting {key}: {result.stderr}")
        except Exception as e:
            print(f"Exception occurred while setting {key}: {e}")

if __name__ == "__main__":
    # Specify the Heroku app name
    HEROKU_APP_NAME = dotenv_values(".env")["HEROKU_APP_NAME"]
    
    # Call the function
    set_heroku_config(app_name=HEROKU_APP_NAME)
    

# summarize.py
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

# Set up OpenAI client with API key from environment variable
client = OpenAI(api_key=os.getenv('YOUR_API_KEY'))

def generate_summary(code_text):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-11-20",  # Using a generally available model
            messages=[
                {"role": "system", "content": "You are a helpful assistant that explains code accurately and concisely."},
                {"role": "user", "content": f"Explain the functionality of the code in brief and concise terms accurately: \n\n{code_text}"}
            ],
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def main():
    if len(sys.argv) != 2:
        print("Usage: python summarize.py <filename>")
        return
    
    filename = sys.argv[1]
    try:
        with open(filename, 'r') as file:
            code = file.read()
        summary = generate_summary(code)
        print("\nSummary:")
        print(summary)
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()

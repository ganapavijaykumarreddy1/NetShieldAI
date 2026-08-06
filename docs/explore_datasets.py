import zipfile
import pandas as pd
import io

def print_parquet_headers(zip_path):
    try:
        with zipfile.ZipFile(zip_path) as z:
            names = z.namelist()
            target = [n for n in names if n.endswith('.parquet')][0]
            with z.open(target) as f:
                df = pd.read_parquet(io.BytesIO(f.read()))
                print(f"--- {zip_path} : {target} ---")
                print("Columns:", list(df.columns))
                print(f"Total features: {len(df.columns)}\n")
                # Also print the head for inspection
                print(df.head(1).T)
    except Exception as e:
        print(f"Error reading {zip_path}: {e}")

print_parquet_headers('data/UNSW_NB15.zip')

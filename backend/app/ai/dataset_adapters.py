import zipfile
import pandas as pd
import numpy as np
import io
import os
from typing import Tuple
from app.features.canonical import CanonicalFeatures

class CICIDS2017Adapter:
    """
    Adapter to load the CICIDS2017 Preprocessed dataset and map it to CanonicalFeatures.
    """
    def __init__(self, data_path: str = None):
        if data_path is None:
            # Assuming this is in backend/app/ai/dataset_adapters.py
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            data_path = os.path.join(base_dir, "data", "CICIDS2017-PREPROCESSED.zip")
        self.data_path = data_path
        
        # Mapping from dataset columns to CanonicalFeatures fields
        self.feature_mapping = {
            'Destination Port': 'destination_port',
            'Flow Duration': 'flow_duration',
            'Total Fwd Packets': 'total_fwd_packets',
            'Total Length of Fwd Packets': 'total_length_fwd_packets',
            'Fwd Packet Length Max': 'fwd_packet_length_max',
            'Fwd Packet Length Min': 'fwd_packet_length_min',
            'Fwd Packet Length Mean': 'fwd_packet_length_mean',
            'Bwd Packet Length Max': 'bwd_packet_length_max',
            'Bwd Packet Length Min': 'bwd_packet_length_min',
            'Bwd Packet Length Mean': 'bwd_packet_length_mean',
            'Flow Bytes/s': 'flow_bytes_s',
            'Flow Packets/s': 'flow_packets_s',
            'Flow IAT Mean': 'flow_iat_mean',
            'Flow IAT Max': 'flow_iat_max',
            'Flow IAT Min': 'flow_iat_min',
            'Fwd IAT Total': 'fwd_iat_total',
            'Bwd IAT Total': 'bwd_iat_total',
            'Fwd Packets/s': 'fwd_packets_s',
            'Bwd Packets/s': 'bwd_packets_s',
            'Packet Length Mean': 'packet_length_mean',
            'Packet Length Variance': 'packet_length_variance',
            'FIN Flag Count': 'fin_flag_count',
            'PSH Flag Count': 'psh_flag_count',
            'ACK Flag Count': 'ack_flag_count',
            'Average Packet Size': 'average_packet_size'
        }

    def load_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Loads the dataset, selects mapped features, and separates X and y.
        Returns:
            X (pd.DataFrame): The canonical features
            y (pd.Series): The string attack types
        """
        abs_path = os.path.abspath(self.data_path)
        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"Dataset not found at {abs_path}")
            
        with zipfile.ZipFile(abs_path) as z:
            csv_files = [n for n in z.namelist() if n.endswith('.csv')]
            if not csv_files:
                raise ValueError("No CSV file found in the zip archive.")
            target_csv = csv_files[0]
            
            with z.open(target_csv) as f:
                # Read using pandas
                df = pd.read_csv(f)
                
        # Handle infinite and NaN values
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df.dropna(inplace=True)
        
        # We need to map columns to the exact names of CanonicalFeatures
        canonical_names = CanonicalFeatures.feature_names()
        
        X = pd.DataFrame()
        
        for dataset_col, canonical_col in self.feature_mapping.items():
            if dataset_col in df.columns:
                X[canonical_col] = df[dataset_col]
            else:
                # If a feature is missing in the dataset, populate with 0
                X[canonical_col] = 0.0
                
        # Ensure ordering matches canonical names exactly
        X = X[canonical_names]
        
        # Label column in preprocessed is usually 'Attack Type' or 'Label'
        label_col = 'Attack Type' if 'Attack Type' in df.columns else 'Label' if 'Label' in df.columns else ' Label'
        if label_col not in df.columns:
            # Fallback search
            for col in df.columns:
                if 'label' in col.lower() or 'attack' in col.lower():
                    label_col = col
                    break
                    
        y = df[label_col]
        
        return X, y

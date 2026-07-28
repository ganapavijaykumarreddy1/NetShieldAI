import os
import time
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score

from app.ai.dataset_adapters import CICIDS2017Adapter

class ModelManager:
    """
    Manages training, evaluation, and selection of the best ML model.
    """
    def __init__(self, model_dir: str = "backend/models"):
        self.model_dir = model_dir
        os.makedirs(self.model_dir, exist_ok=True)
        self.best_model_path = os.path.join(self.model_dir, "best_model.pkl")
        self.scaler_path = os.path.join(self.model_dir, "scaler.pkl")
        self.encoder_path = os.path.join(self.model_dir, "encoder.pkl")
        
    def train_and_evaluate(self):
        print("Loading dataset via Adapter...")
        adapter = CICIDS2017Adapter()
        X, y = adapter.load_data()
        
        print(f"Dataset shape: X={X.shape}, y={y.shape}")
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Encode labels
        # Treat 'BENIGN' or 'Normal' as 0 if possible, but let LabelEncoder handle it
        # We will manually ensure 'BENIGN' is the baseline.
        y = y.apply(lambda x: 'BENIGN' if x.strip().upper() == 'BENIGN' else x.strip())
        
        encoder = LabelEncoder()
        y_encoded = encoder.fit_transform(y)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        print("Evaluating Random Forest...")
        rf = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
        t0 = time.time()
        rf.fit(X_train, y_train)
        rf_time = time.time() - t0
        rf_preds = rf.predict(X_test)
        rf_f1 = f1_score(y_test, rf_preds, average='weighted')
        print(f"RF F1: {rf_f1:.4f} (Time: {rf_time:.2f}s)")
        
        print("Evaluating HistGradientBoosting...")
        gb = HistGradientBoostingClassifier(random_state=42)
        t0 = time.time()
        gb.fit(X_train, y_train)
        gb_time = time.time() - t0
        gb_preds = gb.predict(X_test)
        gb_f1 = f1_score(y_test, gb_preds, average='weighted')
        print(f"GB F1: {gb_f1:.4f} (Time: {gb_time:.2f}s)")
        
        # Select best model
        best_model = rf if rf_f1 >= gb_f1 else gb
        best_f1 = max(rf_f1, gb_f1)
        print(f"Selected Best Model: {best_model.__class__.__name__} with F1={best_f1:.4f}")
        
        # Save artifacts
        with open(self.best_model_path, "wb") as f:
            pickle.dump(best_model, f)
        with open(self.scaler_path, "wb") as f:
            pickle.dump(scaler, f)
        with open(self.encoder_path, "wb") as f:
            pickle.dump(encoder, f)
            
        print("Model and preprocessing artifacts saved successfully.")
        
        # Save a report
        report = classification_report(y_test, best_model.predict(X_test), target_names=encoder.classes_)
        with open(os.path.join(self.model_dir, "evaluation_report.txt"), "w") as f:
            f.write("Model Evaluation Report\n")
            f.write("=======================\n")
            f.write(f"Best Model: {best_model.__class__.__name__}\n")
            f.write(f"Weighted F1: {best_f1:.4f}\n\n")
            f.write(report)
            
if __name__ == "__main__":
    manager = ModelManager()
    manager.train_and_evaluate()

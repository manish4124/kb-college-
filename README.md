# K.B. College AI/ML Student Performance Portal

The project contains a React student/teacher portal, an Express/MySQL backend,
and a Random Forest model that predicts a student's performance category from
attendance, previous marks, and internal marks.

## AI modules

- **Student Performance Predictor**: faculty enter attendance, previous marks,
  and internal marks to receive a Random Forest performance category,
  confidence score, and recommended next step.
- **AI Student Analytics**: the teacher dashboard flags recorded attendance
  below 75%, published-result averages below 50%, good performance, and a
  combined needs-attention list.
- **College Assistant**: students can ask intent-based questions about their
  own attendance, timetable, fees, TC request, and published results. Answers
  are generated from their portal data, not a public chatbot.
- **Admission Analysis**: teachers can generate an advisory academic profile
  from an applicant's submitted 12th marks. It never approves or rejects an
  application; faculty retain that decision.

## Run the project

1. Create the `KBCOLLEGE` MySQL database. Copy
   `backend/.env.example` to `backend/.env` and set your local database
   credentials. The server also accepts those values as normal environment
   variables.
2. Install the AI dependencies and train/retrain the model:

   ```powershell
   python -m pip install -r ai/requirements.txt
   python ai/train_model.py
   ```

3. In one terminal, start the backend:

   ```powershell
   cd backend
   npm install
   npm start
   ```

4. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Sign in as a teacher, then choose **AI Predictor**. The feature sends the
three validated indicators to `POST /api/ml/predict-performance`; inference
runs on the server through `ai/predict.py` and returns a predicted category,
confidence, and recommendation.

The training data in `ai/train_model.py` is illustrative. Replace it with
anonymised, consented historical records and evaluate for bias before making
real academic decisions. Predictions are intended to support faculty review,
not automate decisions about students.

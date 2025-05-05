import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [chapter, setChapter] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState<Record<string, { userAnswer: string; explanation: string }>>({});

  const handleUpload = async () => {
    if (!pdfFile || !chapter) return;

    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    formData.append('chapter', chapter);

    const res = await axios.post('http://localhost:8000/upload-pdf', formData);
    setQuestions(res.data);
  };

  const handleSubmit = async (q: any) => {
    const entry = answers[q.question_text];
    if (!entry) return;

    const payload = {
      question_text: q.question_text,
      user_answer: entry.userAnswer,
      is_correct: entry.userAnswer === q.answer_text,
      explanation: entry.explanation
    };

    await axios.post('http://localhost:8000/submit-answer', payload);
    alert('Answer submitted.');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">PDF Question App</h1>
      <input type="file" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
      <input
        type="text"
        placeholder="Enter chapter keyword"
        className="border p-2 ml-2"
        value={chapter}
        onChange={(e) => setChapter(e.target.value)}
      />
      <button onClick={handleUpload} className="ml-2 p-2 bg-blue-500 text-white rounded">
        Extract Questions
      </button>

      <div className="mt-6">
        {questions.map((q: any) => (
          <div key={q.question_text} className="border p-4 mb-4">
            <p><strong>Question:</strong> {q.question_text}</p>
            <input
              type="text"
              className="border p-2 w-full mt-2"
              placeholder="Your answer"
              onChange={(e) => setAnswers((prev) => ({
                ...prev,
                [q.question_text]: {
                  ...prev[q.question_text],
                  userAnswer: e.target.value
                }
              }))}
            />
            <textarea
              className="border p-2 w-full mt-2"
              placeholder="Explain your reasoning (optional)"
              onChange={(e) => setAnswers((prev) => ({
                ...prev,
                [q.question_text]: {
                  ...prev[q.question_text],
                  explanation: e.target.value
                }
              }))}
            />
            <button onClick={() => handleSubmit(q)} className="mt-2 p-2 bg-green-500 text-white rounded">
              Submit Answer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

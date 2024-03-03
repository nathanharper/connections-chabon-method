// WordInputPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WordInputPage = ({ onSubmit }) => {
  const [words, setWords] = useState(Array(16).fill(''));
  const navigate = useNavigate();

  const handleInputChange = (index, value) => {
    const updatedWords = [...words];
    updatedWords[index] = value;
    setWords(updatedWords);
  };

  const handleSubmit = () => {
    onSubmit(words);
    navigate('/grid');
  };

  return (
    <div>
      <h2>Enter 16 Words</h2>
      <div>
        {words.map((word, index) => (
          <input
            key={index}
            type="text"
            value={word}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`Word ${index + 1}`}
          />
        ))}
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default WordInputPage;

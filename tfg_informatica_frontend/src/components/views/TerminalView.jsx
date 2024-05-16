import queryString from 'query-string';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const TerminalView = ({ activeView }) => {

  const [command, setCommand] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  const { deviceId } = queryString.parse(location.search);

  const handleCommandSubmit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/devices/cli/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      });
      setError('');
      setResult('')
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        const commandOutput = data[command] || "Command executed successfully";
        setResult(commandOutput);
      }
    } catch (error) {
      setError('Error executing command');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleCommandSubmit();
    }
  };

  return (
    <div className="terminal-view view" style={{ display: activeView === 'terminal' ? 'block' : 'none' }}>
      <h2>CLI Terminal</h2>
      <div className="terminal-screen">
        {result && <pre>{result}</pre>}
        {error && <pre className="error">{error}</pre>}
      </div>
      <input 
        type="text" 
        className="terminal-input" 
        value={command} 
        onChange={(e) => setCommand(e.target.value)} 
        onKeyDown={handleKeyDown}
        placeholder="Enter CLI command" 
      />
      <button onClick={handleCommandSubmit} style={{marginTop: "6px"}}>Execute</button>
    </div>
  );
};

export default TerminalView;
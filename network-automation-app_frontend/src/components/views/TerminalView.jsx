import queryString from 'query-string';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const TerminalView = ({ activeView }) => {
  const [commands, setCommands] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();
  const { deviceId } = queryString.parse(location.search);

  const handleCommandSubmit = async () => {
    setError('');
    setResult('');

    const commandList = commands.split(', ').filter(cmd => cmd.trim() !== '');
    if (!commandList.length || !commands.match(/^(\w+.*?, )*\w+.*?$/)) {
      setError('Invalid command format. Use comma and space to separate commands, e.g., "sh version, sh ip interface brief".');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/devices/cli/${deviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commands: commandList })
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        const commandOutput = Object.entries(data).map(([cmd, output]) => (
          <div key={cmd}>
            <span className="terminal-command">{`Command: ${cmd}`}</span>
            <pre>{output}</pre>
          </div>
        ));
        setResult(commandOutput);
      }
    } catch (error) {
      setError('Error executing commands');
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
        {result}
        {error && <pre className="error">{error}</pre>}
      </div>
      <input 
        type="text" 
        className="terminal-input" 
        value={commands} 
        onChange={(e) => setCommands(e.target.value)} 
        onKeyDown={handleKeyDown}
        placeholder="Enter CLI commands separated by comma and space" 
      />
      <button onClick={handleCommandSubmit} style={{ marginTop: "6px" }}>Execute</button>
    </div>
  );
};

export default TerminalView;
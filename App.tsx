
import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Editor from './components/Editor';
import Spinner from './components/common/Spinner';

const App: React.FC = () => {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {session && user ? (
        <>
          <Header />
          <main>
            <Editor />
          </main>
        </>
      ) : (
        <LoginPage />
      )}
    </div>
  );
};

export default App;

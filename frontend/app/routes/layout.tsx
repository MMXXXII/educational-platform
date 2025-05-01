import React, { useState } from "react";
import { Outlet } from "react-router";
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

export default function ProjectLayout() {
    // Здесь будет проверка аутентификации пользователя
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    // Временная функция для демонстрации переключения состояния аутентификации
    // Будет убрано и заменено настоящей аутентификацией
  const toggleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />
      
      {/* Временная кнопка для демонстрации - убрать */}
      <button 
          onClick={toggleAuth} 
          className="fixed bottom-4 right-4 bg-gray-200 p-2 rounded-md text-sm z-50"
      >
          {isAuthenticated ? 'Выйти' : 'Симулировать вход'}
      </button>
      
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
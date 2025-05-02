import React from 'react';
import { Link } from 'react-router';

export function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-4 sm:py-6">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0">
                        <Link to="/" className="text-lg font-medium text-white hover:text-gray-300">
                            EduPlatform
                        </Link>
                        <span className="mx-2 text-sm text-gray-400 hidden sm:inline">•</span>
                        <Link to="/about" className="text-sm text-gray-300 hover:text-white">
                            О платформе
                        </Link>
                    </div>
                    <div className="text-center text-gray-400 text-sm">
                        Copyright © EduPlatform {new Date().getFullYear()}
                    </div>
                </div>
            </div>
        </footer>
    );
}
import React from 'react';
import { BOT_NAME } from '../constants';

const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M1.25 5.342A.75.75 0 0 1 2 4.75h16a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75V13.5a.75.75 0 0 0-.75-.75H8.5a.75.75 0 0 0-.75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75V5.342ZM4.25 6.25v2.5h2.5v-2.5h-2.5Zm0 3.5v2.5h2.5v-2.5h-2.5Zm3.5-3.5h2.5v2.5h-2.5v-2.5Zm0 3.5h2.5v2.5h-2.5v-2.5Zm3.5-3.5h2.5v2.5h-2.5v-2.5Zm0 3.5h2.5v2.5h-2.5v-2.5Z" clipRule="evenodd" />
    </svg>
);

const Header: React.FC = () => {
    return (
        <div className="p-3 border-b border-gray-200 bg-white flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <BuildingIcon />
            </div>
            <div>
                <h1 className="text-md font-bold text-gray-800">{BOT_NAME}</h1>
                <p className="text-xs text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    Online
                </p>
            </div>
        </div>
    );
};

export default Header;
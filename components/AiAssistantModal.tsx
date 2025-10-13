import * as React from 'react';
import type { AppSettings } from '../types';
import type { TFunction } from '../App';
import { getAiAssistance } from '../services/geminiService';
import { Loader } from './Loader';

export const AiAssistantModal: React.FC<{
    topic: string;
    onClose: () => void;
    settings: AppSettings;
    t: TFunction;
    parseError: (e: any) => string;
}> = ({ topic, onClose, settings, t, parseError }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [category, setCategory] = React.useState<'hook' | 'cta' | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const getSuggestions = async (type: 'hook' | 'cta') => {
        setIsLoading(true);
        setError(null);
        setCategory(type);
        try {
            const result = await getAiAssistance(topic, type, settings);
            setSuggestions(result);
        } catch (err) {
            setError(parseError(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('assistantTitle')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{t('assistantSubtitle1')}<span className="font-semibold">{topic}</span>{t('assistantSubtitle2')}</p>
                <div className="flex space-x-4 mb-4">
                    <button onClick={() => getSuggestions('hook')} className="flex-1 px-4 py-2 border rounded-md">{t('getHookButton')}</button>
                    <button onClick={() => getSuggestions('cta')} className="flex-1 px-4 py-2 border rounded-md">{t('getCTAButton')}</button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading ? (
                        <Loader text={t('generatingContentMessage')} />
                    ) : error ? (
                         <div className="text-red-600 dark:text-red-400">{error}</div>
                    ) : suggestions.length > 0 ? (
                        <ul className="space-y-3">
                            {suggestions.map((s, i) => (
                                <li key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-gray-700 dark:text-gray-300">{s}</li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('assistantEmpty')}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

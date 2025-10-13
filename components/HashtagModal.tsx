import * as React from 'react';
import type { TFunction } from '../App';
import { Loader } from './Loader';

export const HashtagModal: React.FC<{
    topic: string;
    onClose: () => void;
    isLoading: boolean;
    hashtags: string[];
    error: string | null;
    t: TFunction;
}> = ({ topic, onClose, isLoading, hashtags, error, t }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        const textToCopy = hashtags.map(h => `#${h}`).join(' ');
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('hashtagModalTitle')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
                </div>
                 <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{t('hashtagModalSubtitle1')}<span className="font-semibold">{topic}</span>{t('hashtagModalSubtitle2')}</p>
                <div className="flex-grow overflow-y-auto pr-2 mb-4">
                     {isLoading ? (
                        <Loader text={t('generatingContentMessage')} />
                    ) : error ? (
                         <div className="text-red-600 dark:text-red-400">{error}</div>
                    ) : hashtags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {hashtags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 rounded-full text-sm">#{tag}</span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('hashtagModalEmpty')}</div>
                    )}
                </div>
                {hashtags.length > 0 && (
                    <button onClick={handleCopy} className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        {copied ? t('hashtagModalCopiedButton') : t('hashtagModalCopyButton')}
                    </button>
                )}
            </div>
        </div>
    );
};

import React, { useState, useCallback, ChangeEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { editImageWithGemini } from '../services/geminiService';
import { uploadToDrive } from '../services/googleDriveService';
import Button from './common/Button';
import Spinner from './common/Spinner';
// FIX: import supabase client to update user credits
import { supabase } from '../services/supabaseClient';

const Editor: React.FC = () => {
    const { user, refreshUser, session } = useAuth();
    const [prompt, setPrompt] = useState<string>('');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [statusText, setStatusText] = useState<string>('');

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setOriginalImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setEditedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!prompt || !originalImageFile || !user) return;
        if (user.credits <= 0) {
            setError('You have no credits left. Please purchase more to continue editing.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStatusText('Warming up the AI...');
        setEditedImage(null);

        try {
            const base64Image = await fileToBase64(originalImageFile);
            
            setStatusText('Sending to Gemini AI for editing...');
            const result = await editImageWithGemini(base64Image, originalImageFile.type, prompt);

            if (result.editedImageBase64) {
                setStatusText('Image generation successful!');
                setEditedImage(`data:image/png;base64,${result.editedImageBase64}`);
                // Decrement credits
                await supabase.from('users').update({ credits: user.credits - 1 }).eq('id', user.id);
                await refreshUser();
            } else {
                throw new Error(result.modelTextResponse || 'Failed to generate image. The model did not return an image.');
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Generation failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setStatusText('');
        }
    };

    const handleSaveToDrive = async () => {
        if (!editedImage || !originalImageFile || !session?.provider_token) return;

        setIsSaving(true);
        setError(null);
        try {
            const newFileName = `edited-${originalImageFile.name}`;
            await uploadToDrive(editedImage, newFileName, session.provider_token);
            alert('Successfully saved to your Google Drive!');
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to save to Google Drive: ${errorMessage}. Please ensure you have granted permissions.`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls Column */}
                <div className="lg:col-span-4 bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col space-y-6 h-fit">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Upload Your Photo</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">2. Describe Your Edit</label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="mt-2 block w-full shadow-sm sm:text-sm bg-gray-900 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                            placeholder="e.g., 'add a futuristic city in the background', 'make it a cyberpunk style', 'change the dog to a cat'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={!originalImage}
                        />
                    </div>
                    <Button onClick={handleGenerate} disabled={!prompt || !originalImage || isLoading} size="lg" className="w-full justify-center">
                        {isLoading ? <><Spinner /> {statusText || 'Generating...'}</> : `Generate (1 Credit)`}
                    </Button>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </div>

                {/* Image Display Column */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-2 text-gray-400">Original</h3>
                            <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden">
                                {originalImage ? <img src={originalImage} alt="Original" className="object-contain max-h-full max-w-full" /> : <p className="text-gray-500">Upload an image to start</p>}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-2 text-gray-400">Edited</h3>
                            <div className="aspect-square w-full bg-gray-800 rounded-lg flex flex-col items-center justify-center border border-gray-700 overflow-hidden relative">
                                {isLoading && <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4"><Spinner size="lg" /><p className="mt-4 text-white">{statusText}</p></div>}
                                {!isLoading && editedImage && <img src={editedImage} alt="Edited" className="object-contain max-h-full max-w-full" />}
                                {!isLoading && !editedImage && <p className="text-gray-500">Your AI-edited image will appear here</p>}
                            </div>
                            {editedImage && !isLoading && (
                                <Button onClick={handleSaveToDrive} disabled={isSaving} className="mt-4">
                                    {isSaving ? <><Spinner /> Saving...</> : 'Save to Google Drive'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Editor;
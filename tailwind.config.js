export const darkMode = 'class';
export const content = [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
];
export const theme = {
    extend: {
        colors: {
            'bg-primary': 'var(--bg-primary)',
            'bg-secondary': 'var(--bg-secondary)',
            'bg-tertiary': 'var(--bg-tertiary)',
            'bg-hover': 'var(--bg-hover)',
            'text-primary': 'var(--text-primary)',
            'text-secondary': 'var(--text-secondary)',
            'text-tertiary': 'var(--text-tertiary)',
            'border-color': 'var(--border-color)',
            'card-bg': 'var(--card-bg)',
            'card-border': 'var(--card-border)',
            'input-bg': 'var(--input-bg)',
            'input-border': 'var(--input-border)',
            'input-text': 'var(--input-text)',
        },
    },
};
export const plugins = [];

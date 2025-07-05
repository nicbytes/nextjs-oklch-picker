const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between">
        <span>{label}</span>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);

export default ToggleSwitch;
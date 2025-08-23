import * as React from 'react';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.841C34.524 4.962 29.563 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5c11.146 0 20.24-8.835 20.24-19.832c0-1.18-.108-2.316-.309-3.417z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.843-5.843A19.933 19.933 0 0 0 24 2.5C16.318 2.5 9.5 6.963 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 45.5c5.563 0 10.524-2.462 14.804-6.338l-6.522-5.023A11.96 11.96 0 0 1 24 36c-5.228 0-9.654-3.657-11.297-8.508l-6.571 4.819A21.45 21.45 0 0 0 24 45.5z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.522 5.023c3.92-3.638 6.48-9.077 6.48-15.023c0-1.18-.108-2.316-.309-3.417z"></path>
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const LoaderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className}>
        <radialGradient id="a12" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)">
            <stop offset="0" stopColor="#00C2CB"></stop>
            <stop offset=".3" stopColor="#00C2CB" stopOpacity=".9"></stop>
            <stop offset=".6" stopColor="#00C2CB" stopOpacity=".6"></stop>
            <stop offset=".8" stopColor="#00C2CB" stopOpacity=".3"></stop>
            <stop offset="1" stopColor="#00C2CB" stopOpacity="0"></stop>
        </radialGradient>
        <circle transform-origin="center" fill="none" stroke="url(#a12)" strokeWidth="15" strokeLinecap="round" strokeDasharray="200 1000" strokeDashoffset="0" cx="100" cy="100" r="70">
            <animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform>
        </circle>
        <circle transform-origin="center" fill="none" opacity=".2" stroke="#00C2CB" strokeWidth="15" strokeLinecap="round" cx="100" cy="100" r="70"></circle>
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <path d="M494.701,212.481l-28.245-5.44c-26.524-5.091-38.686-36.072-22.715-57.848l17.728-24.17 c6.228-8.491,5.329-20.256-2.117-27.702l-38.293-38.293c-7.233-7.233-18.581-8.314-27.05-2.577l-23.808,16.128 c-22.352,15.131-52.859,1.819-56.978-24.867L308.682,18.1C307.085,7.688,298.128,0,287.595,0h-54.165 c-10.232,0-19.022,7.264-20.951,17.312l-6.997,36.459c-4.995,25.931-34.876,38.311-56.751,23.498l-30.74-20.82 c-8.468-5.736-19.816-4.654-27.048,2.578L52.648,97.32c-7.446,7.446-8.345,19.211-2.117,27.702l17.728,24.171 c15.971,21.776,3.809,52.756-22.702,57.845l-28.258,5.442C7.257,214.415,0,223.203,0,233.429v54.144 c0,10.528,7.68,19.482,18.085,21.085l29.632,4.565c26.699,4.105,40.01,34.618,24.862,56.976L56.45,394.009 c-5.737,8.468-4.655,19.817,2.577,27.05l38.293,38.293c7.446,7.446,19.211,8.345,27.702,2.117l24.171-17.728 c21.776-15.971,52.764-3.809,57.869,22.712l5.416,28.233C214.406,504.735,223.197,512,233.429,512h54.165 c10.532,0,19.488-7.686,21.086-18.096l3.2-20.843c4.199-27.285,35.833-40.394,58.097-24.07l16.993,12.473 c8.491,6.233,20.26,5.335,27.708-2.113l38.293-38.293c7.233-7.233,8.314-18.581,2.577-27.05l-16.128-23.808 c-15.149-22.359-1.838-52.872,24.855-56.976l29.638-4.566C504.32,307.055,512,298.101,512,287.573v-54.144 C512,223.203,504.743,214.415,494.701,212.481z M469.333,269.275l-11.547,1.779c-57.654,8.865-86.411,74.78-53.688,123.077 l6.244,9.217l-12.886,12.886l-2.242-1.646c-48.101-35.266-116.436-6.949-125.506,51.99l-0.423,2.754h-18.228l-2.097-10.931 c-11.027-57.294-77.962-83.566-125.003-49.066l-9.412,6.903l-12.89-12.89l6.245-9.219 c32.722-48.296,3.966-114.211-53.695-123.077l-11.541-1.778v-18.229l10.947-2.108c57.275-10.994,83.553-77.935,49.051-124.978 l-6.903-9.412l12.891-12.891l16.152,10.94c47.243,31.991,111.785,5.253,122.576-50.77l3.677-19.16h18.226l1.768,11.532 c8.899,57.651,74.781,86.398,123.072,53.707l9.225-6.249l12.89,12.89l-6.903,9.411c-34.503,47.044-8.225,113.984,49.063,124.981 l10.934,2.106V269.275z"></path>
      <path d="M256,149.327c-58.907,0-106.667,47.759-106.667,106.667S197.093,362.66,256,362.66s106.667-47.759,106.667-106.667 S314.907,149.327,256,149.327z M256,319.994c-35.343,0-64-28.657-64-64s28.657-64,64-64s64,28.657,64,64 S291.343,319.994,256,319.994z"></path>
    </g>
  </svg>
);


export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

export const ThreadsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm-1.25 14.5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0v5zm3.5 0a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 1.5 0v5zM8.5 9.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75zm8.5 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75zM12 8.25c-2.071 0-3.75 1.679-3.75 3.75s1.679 3.75 3.75 3.75s3.75-1.679 3.75-3.75S14.071 8.25 12 8.25z"></path>
    </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a2.25 2.25 0 0 0-2.25 2.25 2.25 2.25 0 0 0 2.25 2.25 2.25 2.25 0 0 0 2.25-2.25A2.25 2.25 0 0 0 12 12Z" />
    </svg>
);

export const AvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

export const HashtagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.5-15-3 15m-3-15-3 15" />
    </svg>
);

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

// --- Text Formatting Icons ---
export const BoldIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M2 1H8.625C11.0412 1 13 2.95875 13 5.375C13 6.08661 12.8301 6.75853 12.5287 7.35243C13.4313 8.15386 14 9.32301 14 10.625C14 13.0412 12.0412 15 9.625 15H2V1ZM5.5 9.75V11.5H9.625C10.1082 11.5 10.5 11.1082 10.5 10.625C10.5 10.1418 10.1082 9.75 9.625 9.75H5.5ZM5.5 6.25H8.625C9.10825 6.25 9.5 5.85825 9.5 5.375C9.5 4.89175 9.10825 4.5 8.625 4.5H5.5V6.25Z" />
    </svg>
);
export const ItalicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M14 1H5V4H7.75219L5.08553 12H2V15H11V12H8.24781L10.9145 4H14V1Z" />
    </svg>
);
export const UnderlineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 1V7C3 9.76142 5.23858 12 8 12C10.7614 12 13 9.76142 13 7V1H10V7C10 8.10457 9.10457 9 8 9C6.89543 9 6 8.10457 6 7V1H3Z" />
        <path d="M14 16V14H2V16H14Z" />
    </svg>
);
export const StrikethroughIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5 4.75C5 4.45531 5.16258 4.05336 5.69626 3.66792C6.22795 3.28392 7.03762 3 8 3C9.75028 3 10.7599 3.87319 10.9539 4.4663L13.8053 3.5337C13.0616 1.26011 10.5055 0 8 0C6.4771 0 5.03677 0.443615 3.93978 1.23588C2.84478 2.02672 2 3.24977 2 4.75C2 5.59786 2.26982 6.35719 2.70214 7H0V9H16V7H10.7035C9.87766 6.67447 8.95507 6.5 8 6.5C7.03762 6.5 6.22795 6.21608 5.69626 5.83208C5.16258 5.44664 5 5.04469 5 4.75Z" />
        <path d="M11 11.25C11 11.1732 10.989 11.0892 10.9632 11H13.9921C13.9973 11.0824 14 11.1658 14 11.25C14 12.7502 13.1552 13.9733 12.0602 14.7641C10.9632 15.5564 9.5229 16 8 16C5.49455 16 2.93836 14.7399 2.19473 12.4663L5.0461 11.5337C5.24008 12.1268 6.24972 13 8 13C8.96238 13 9.77205 12.7161 10.3037 12.3321C10.8374 11.9466 11 11.5447 11 11.25Z" />
    </svg>
);
export const CaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M16.5142 2.7501C16.9323 2.75603 17.3026 3.0215 17.4425 3.41559L22.9425 18.9156C23.1271 19.4361 22.8549 20.0077 22.3344 20.1924C21.8139 20.3771 21.2423 20.1049 21.0576 19.5844L19.7857 16L12.8304 16L11.4326 19.611C11.2332 20.126 10.6541 20.3819 10.139 20.1826C9.62399 19.9832 9.36808 19.404 9.56746 18.889L15.5675 3.38901C15.7184 2.99904 16.0961 2.74417 16.5142 2.7501ZM16.4593 6.62545L13.6046 14L19.076 14L16.4593 6.62545Z" />
        <path d="M8.25 20.2604C7.79939 20.2604 7.41867 19.9625 7.29352 19.5529C6.40302 20.0157 5.55589 20.2604 4.75 20.2604C2.77954 20.2604 1.25 18.8599 1.25 16.7604C1.25 15.8382 1.56906 15.0234 2.16035 14.4079C2.75035 13.7938 3.59693 13.3929 4.62959 13.2677C5.48568 13.1638 6.35256 13.21 7.22644 13.4026C7.18035 13.0648 7.06388 12.8244 6.88899 12.6546C6.65902 12.4314 6.28535 12.2882 5.70034 12.2591C4.75405 12.2121 4.148 12.3504 3.82178 12.5791C3.3696 12.8962 2.74598 12.7867 2.42888 12.3345C2.11179 11.8823 2.22131 11.2587 2.6735 10.9416C3.39111 10.4384 4.34684 10.2302 5.50465 10.2515L5.50864 10.2516L5.79966 10.2616C6.82486 10.3126 7.66878 10.6349 8.26882 11.2072C8.87029 11.7809 9.20249 12.5827 9.24525 13.5444L9.24544 13.55L9.25 13.7604V19.2604C9.25 19.7668 8.87372 20.185 8.38538 20.2513L8.37699 20.2524L8.2584 20.2604H8.25ZM4.87041 15.2895C4.29054 15.3598 3.88858 15.5454 3.63341 15.7967C3.38209 16.0442 3.25 16.3779 3.25 16.7967C3.25 17.2894 3.40867 17.6583 3.66052 17.9041C3.91333 18.1508 4.28388 18.2967 4.75 18.2967C5.35855 18.2967 6.14677 18.0129 7.11197 17.3755L7.249 17.282V15.5105L7.12728 15.4742C6.3497 15.2606 5.59939 15.201 4.87041 15.2895Z" />
    </svg>
);
export const AlignLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M11 1H1V3H11V1Z" />
        <path d="M1 5H15V7H1V5Z" />
        <path d="M11 9H1V11H11V9Z" />
        <path d="M15 13H1V15H15V13Z" />
    </svg>
);
export const AlignCenterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M13 1H3V3H13V1Z" />
        <path d="M1 5H15V7H1V5Z" />
        <path d="M13 9H3V11H13V9Z" />
        <path d="M15 13H1V15H15V13Z" />
    </svg>
);
export const AlignRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M15 1H5V3H15V1Z" />
        <path d="M1 5H15V7H1V5Z" />
        <path d="M15 9H5V11H15V9Z" />
        <path d="M15 13H1V15H15V13Z" />
    </svg>
);
export const AlignJustifyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M15 1H1V3H15V1Z" />
        <path d="M1 5H15V7H1V5Z" />
        <path d="M15 9H1V11H15V9Z" />
        <path d="M11 13H1V15H11V13Z" />
    </svg>
);
import down from '../assets/images/chevron-down.svg'

export default function RoundedButton({ className = '', isDropdown = false, children, ...rest }) {
    return <button className={`rounded-button ${className}`} {...rest}>
        {children}
        {isDropdown && <img src={down} width={24} height={24} alt="Dropdown Icon" />}
    </button>
}
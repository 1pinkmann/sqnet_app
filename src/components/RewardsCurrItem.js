import { useState, useEffect } from "react";
import RoundedButton from "./RoundedButton";
import close from '../assets/images/close.svg'

export default function RewardsCurrItem({ logo, chosenOption, text, percent, onChange, options }) {

    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [results, setResults] = useState([])
    const [showResults, setShowResults] = useState(true)

    useEffect(() => {

        if (search.length > 0) {
            setResults(options.filter((option) => {
                return option.currency.toLowerCase().includes(search.toLowerCase())
            }))
            setShowResults(true)
            setIsOpen(true)
        } else {
            setResults(options)
        }
        return () => {
            setIsOpen(false)
            setShowResults(false)
        }

    }, [search, options])


    return <div className="rewards-curr-item">
        <div className="" style={{ position: 'relative' }} >
            <RoundedButton style={{ minWidth: '170px', maxWidth: '170px' }} isDropdown={true} onClick={() => {
                setIsOpen((v) => {
                    if (!v) {
                        setShowResults(true)
                    }
                    return !v
                })
            }}>
                <img src={logo} width={24} height={24} alt="Logo" />
                {text}
            </RoundedButton>
            <div className={`dropdown-btn-item ${isOpen ? 'show' : ''}`}>
                <div className="dropdown-container-ssl">
                    {results.length > 0 ? <div className="results">
                        <div className="top">
                            <span>Select Token</span>

                            <div style={{ cursor: 'pointer' }} onClick={() => { setIsOpen(false) }}>
                                <img src={close} alt="close icon" width={24} height={24} />
                            </div>

                        </div>
                        <ul>
                            {results.map((result, id) => {
                                return <li key={`li-result-${id}`} onClick={(e) => {
                                    e.preventDefault()
                                    setShowResults(false)
                                    setIsOpen(false)
                                    onChange(result.address)
                                }}>
                                    {result['logo'] && <img src={result['logo']} width={24} height={24} style={{ marginRight: '24px' }} />}
                                    <span>
                                        {result.currency}
                                    </span>
                                    <span className={`radius-option ${chosenOption === result.address ? 'active' : ''}`}>
                                        <span className="inner"></span>
                                    </span>
                                </li>
                            })}
                        </ul>
                    </div> : <div className="no-results">
                        No results found.
                    </div>}
                </div>
            </div>
        </div>
        <span style={{ color: '#C21F48', fontWeight: '700', fontSize: '14px' }}>{percent}%</span>

        <div className="vertical-center" style={{ width: '100%', marginRight: '16px', background: '#A1A1A1', borderRadius: '3px' }}>
            <div style={{ width: `calc(${percent}%)`, height: '4px', background: '#C21F48', borderRadius: '3px', display: 'flex', maxWidth: '100%', animation: 'all 2000ms ease-in-out' }}>
            </div>
        </div >

    </div >
}
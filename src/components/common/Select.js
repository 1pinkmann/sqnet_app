import React, { useEffect, useState } from 'react';
import Arrow from './../../Icons/Arrow';
import { checkForScrollbar } from "../../services/scrollbarService";

export default function Select({ className, list, setList }) {
    const [opened, setOpened] = useState(false);
    let selected = list.find(item => item.selected === true);

    function selectItem(index) {
        setList(index);
    }

    function toggleSelect() {
        setOpened(state => !state);
    }

    useEffect(() => {
        function handleDocumentClick() {
            if (opened) {
                toggleSelect();
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        }
    }, [opened]);

    return (
        <div className={"select " + (className || "") + (opened ? " opened" : "") + (checkForScrollbar() ? " scroll-visible" : "")}>
            <button className="select__button" onClick={toggleSelect}>
                <img src={selected.icon} alt={selected.title} className="select__button-icon" />
                <span className="select__button-text">{selected.title}</span>
                <Arrow className="select__button-arrow" />
            </button>
            <div className="select__list-wrapper">
                <ul className="select__list scrollwrapper select__scrollwrapper">
                    {list.map((item, index) => {
                        return (
                            <li className="select__item" key={`unique-item-${item.id}`}>
                                <button
                                    className={"select__item-button" + (item.selected ? " selected" : "")}
                                    onClick={() => {
                                        selectItem(index);
                                    }}
                                >
                                    <img src={item.icon} alt={item.title} className="select__item-icon" />
                                    <span>{item.title}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    )
}
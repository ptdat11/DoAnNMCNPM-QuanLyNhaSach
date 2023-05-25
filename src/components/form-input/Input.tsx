import React, { HTMLInputTypeAttribute } from "react";
import { BaseProps } from "../../submodules/base-props/base-props";
import combineClassnames from "../../submodules/string-processing/combine-classname";
import { THEME } from "../../settings";

interface Props extends BaseProps {
    label?: string,
    type?: HTMLInputTypeAttribute,
    value?: number | string,
    checked?: boolean,
    placeholder?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
};

const Input: React.FC<Props> = React.memo((props) => {
    return (
        <label
            className={combineClassnames(
                props.className,
                THEME.text
            )}
            >
            <span
                className={combineClassnames(
                    THEME.textHighlight
                )}
                >
                {props.label}
            </span>
            <input
                style={{...props.style}}
                className={combineClassnames(
                    THEME.border,
                    THEME.bg,
                    "leading-8 ml-3 rounded-sm border"
                )}
                type={props.type}
                value={props.value}
                checked={props.checked}
                placeholder={props.placeholder}
                onChange={props.onChange}
            />
        </label>
    );
});

export default Input;
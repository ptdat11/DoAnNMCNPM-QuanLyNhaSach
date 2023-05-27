import React, { useEffect, useRef, useState } from "react";
import { BasePropsPage } from "../../submodules/base-props/base-props";
import PageLayout from "../../components/layout/page-layout/PageLayout";
import combineClassnames from "../../submodules/string-processing/combine-classname";
import Input from "../../components/form-input/Input";
import { THEME } from "../../settings";
import { dateTimeToLocalISOString, dateToString } from "../../submodules/string-processing/date-string";
import LargeButton from "../../components/button/LargeButton";
import { toast } from "react-toastify";
import { DebtLogsPOST } from "../../interfaces/api-formats/debt-logs";
import { jsonFetch } from "../../submodules/networking/jsonFetch";
import { useRecoilValue } from "recoil";
import { apiUrlSelector } from "../../states/system-states";
import Customer from "../../interfaces/customer";
import LocalStorage from "../../submodules/local-storage/local-storage";
import AppConstraint from "../../interfaces/app-constraint";

interface Props extends BasePropsPage {}

const PayDebtPage = React.memo((props: Props) => {
    const [customer, setCustomer] = useState<Customer>({
        FullName: "",
        Address: "",
        PhoneNumber: "",
        Email: ""
    })
    const [dateTime, setDateTime] = useState(new Date());
    const [debtPaid, setDebtPaid] = useState(0);
    const phoneMatched = useRef(false);
    const customerApiUrl = useRecoilValue(apiUrlSelector("customers"));
    const debtApiUrl = useRecoilValue(apiUrlSelector("debt-logs"));

    useEffect(() => {
        let id = setTimeout(() => setDateTime(new Date()), 1000);

        return () => clearTimeout(id);
    });

    const handleClickPay = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (
            customer.PhoneNumber === "" ||
            !phoneMatched.current ||
            debtPaid <= 0
        ) {
            toast.warn("Hãy nhập đầy đủ thông tin", { toastId: "DEBT_EMPTY_INFO" });
            return;
        }

        const data: DebtLogsPOST = {
            Customer: customer,
            DebtDate: dateToString(dateTime) as string,
            Paid: debtPaid
        };

        let response = await jsonFetch(debtApiUrl, "POST", data);
        switch (response.status) {
            case 400:
                if (LocalStorage.get<AppConstraint>("settings")?.PaidNotGreaterThanDebt) {
                    toast.error("Không thể thu vượt quá số tiền nợ", { toastId: "DEBT_GREATER" });
                    setCustomer({
                        FullName: "",
                        Email: "",
                        PhoneNumber: customer.PhoneNumber,
                        Address: ""
                    });
                }
                else toast.error("Server đã xảy ra sự cố", { toastId: "DEBT_SERVER_ERR" });
                return;
            case 201:
                toast.success("Đã thu nợ thành công", { toastId: "DEBT_SUCCESS" });
        }
    };

    return (
        <PageLayout
            id={props.id}
            className={combineClassnames(
                props.className
            )}
            style={{...props.style}}
        >
            <form className="w-11/12 lg:w-8/12 mx-auto [&>*]:block [&>*]:flex [&>*]:justify-between">
                <Input 
                    className={combineClassnames(
                        THEME.bgSemi,
                        "p-1 my-2 rounded items-center"
                    )}
                    inputClassName="w-40 lg:w-48"
                    label="Khách hàng"
                    value={customer.FullName}
                    placeholder="Họ tên"
                    type="text"
                />
                <Input
                    className={combineClassnames(
                        THEME.bgSemi,
                        "p-1 my-2 rounded items-center"
                    )}
                    inputClassName="w-40 lg:w-48"
                    label="Địa chỉ"
                    value={customer.Address}
                    type="text"
                />
                <Input
                    className={combineClassnames(
                        THEME.bgSemi,
                        "p-1 my-2 rounded items-center"
                    )}
                    inputClassName="w-40 lg:w-48"
                    label="Điện thoại"
                    value={customer.PhoneNumber}
                    type="tel"
                    onChange={(e) => setCustomer({ ...customer, PhoneNumber: e.target.value })}
                    onBlur={async (e) => {
                        let response = await jsonFetch(`${customerApiUrl}/${e.target.value}`, "GET");
                        switch (response.status) {
                            case 404:
                                toast.error("Không thể tìm thấy khách hàng với SĐT này");
                                phoneMatched.current = false;
                                break;
                            case 200:
                                toast.success("SĐT hợp lệ");
                                phoneMatched.current = true;
                                const cust: Customer = await response.json();
                                setCustomer(cust);
                                break;
                        }
                    }}
                />
                <Input
                    className={combineClassnames(
                        THEME.bgSemi,
                        "p-1 my-2 rounded items-center"
                    )}
                    inputClassName="w-40 lg:w-48"
                    label="Email"
                    value={customer.Email}
                    type="email"
                />
                <Input
                    className={combineClassnames(
                        THEME.bgSemi,
                        "p-1 my-2 rounded items-center"
                    )}
                    inputClassName="w-[11.8rem] lg:w-48"
                    label="Ngày thu tiền"
                    readonly
                    value={dateTimeToLocalISOString(dateTime)}
                    type="datetime-local"
                />
                <Input 
                    className={combineClassnames(
                        THEME.bgSemi,
                        "p-1 my-2 rounded items-center"
                    )}
                    inputClassName="w-40 lg:w-48"
                    label="Số tiền thu (VNĐ)"
                    value={debtPaid}
                    type="number"
                    onChange={(e) => {
                        let newDebtPaid = Number(e.target.value.split(",").join(""));
                        setDebtPaid(newDebtPaid);
                    }}
                />
            </form>
            <LargeButton
                className="mx-auto"
                onClick={handleClickPay}
            >
                THU
            </LargeButton>
        </PageLayout>
    );
});

export default PayDebtPage;
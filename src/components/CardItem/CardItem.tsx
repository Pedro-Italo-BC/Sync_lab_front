import Image from "next/image";
import { Button } from "../Button/Button";


export function CardItem() {
    return (
        <div className="flex w-lg h-52 bg-white rounded-lg">
            <img className="h-full w-44 rounded-l-lg" alt="" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/250px-Arduino_Uno_-_R3.jpg"/>
            <div className="px-2 py-4 flex flex-col justify-between flex-1">
                <div className="pt-2 flex-1">
                    <div className="mb-2 ">
                        <h3 className="font-bold text-[2rem]/6">Arduino</h3>
                        <span className="font-normal text-[var(--gray-200)]">Pendente</span>
                    </div>

                    <p className="flex-1 w-full h-12 line-clamp-2">Gostariaasdadasda a d asd asd ad as da dasd as dasdasdaasd das dasdasasdsdsada dadsd asdasasdas ad asdassd as dds ds ds das dasdad de  sar</p>
                </div>

                <Button size="nm" title="Ver pedido" buttonStyle="PRIMARY"/>

            </div>
        </div>
    )
}
import React, { forwardRef } from 'react';

interface TicketProps {
    orden: any;
}

const Ticket = forwardRef<HTMLDivElement, TicketProps>(({ orden }, ref) => {
    if (!orden) return null;

    // Helper Súper-Mejorado para extraer Paquetes (Kiosco o POS), Extras y Sin
    const renderPersonalizacionTicket = (itemCarrito: any) => {
        if (!itemCarrito) return null;
        
        const pj = itemCarrito.personalizacion;
        const producto = itemCarrito.producto;
        const lineas: string[] = [];

        // 1. Si es Paquete (Buscamos si viene del Kiosco o directo del POS)
        const contenido = pj?.Contenido || pj?.contenido || producto?.items;
        if (contenido) {
            contenido.forEach((c: any) => lineas.push(`> ${c.quantity || 1}x ${c.product_name || c.name}`));
        }

        // 2. Si tiene Modificaciones (Extras / Sin)
        if (pj?.modificaciones) {
            pj.modificaciones.extras?.forEach((e: any) => lineas.push(`+ Extra ${e.name}`));
            pj.modificaciones.sin?.forEach((s: any) => lineas.push(`- SIN ${s.name}`));
        }

        // 3. Si es Armada desde cero
        if (pj) {
            const categoriasArmada = Object.keys(pj).filter(k => k !== 'modificaciones' && k !== 'Contenido' && k !== 'contenido');
            if (categoriasArmada.length > 0) {
                const ingredientesArmados = categoriasArmada.flatMap(k => pj[k].map((i: any) => i.name));
                if (ingredientesArmados.length > 0) lineas.push(`[${ingredientesArmados.join(', ')}]`);
            }
        }

        if (lineas.length === 0) return null;

        return (
            <div className="text-[10px] font-bold ml-2 leading-tight">
                {lineas.map((linea, idx) => <div key={idx}>{linea}</div>)}
            </div>
        );
    };

    return (
        <div ref={ref} className="bg-white text-black p-4 font-mono w-[58mm] mx-auto" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
            
            {/* CABECERA */}
            <div className="text-center mb-4">
                <h1 className="font-bold text-2xl uppercase tracking-widest">GABUNNI</h1>
                <p className="text-xs font-bold mt-1">"Rico y con amor"</p>
                <p className="text-xs">--------------------------------</p>
                <p className="text-xs">Ticket de Venta</p>
                <p className="text-xs">{new Date().toLocaleString('es-MX')}</p>
            </div>

            {/* DATOS DE LA ORDEN */}
            <div className="mb-4 text-xs">
                <p className="font-bold text-lg mb-1">Turno: #{orden.daily_sequence || orden.order_number?.substring(0,4) || '??'}</p>
                <p className="font-semibold"><strong>Cliente:</strong> {orden.client_name || 'Mostrador'}</p>
                <p className="font-semibold"><strong>Tipo:</strong> {orden.type_delivery}</p>
                <p className="font-semibold"><strong>Pago:</strong> {orden.metodo_pago || 'Efectivo'}</p>
            </div>

            <p className="text-xs text-center mb-2">--------------------------------</p>

            {/* PRODUCTOS se lee el snapshot del carrito  */}
            <table className="w-full text-xs mb-4">
                <thead>
                    <tr className="border-b border-black border-dashed">
                        <th className="text-left w-8 pb-1">Cant</th>
                        <th className="text-left pb-1">Descripción</th>
                        <th className="text-right pb-1">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orden.details_snapshot?.map((item: any, i: number) => (
                        <React.Fragment key={i}>
                            <tr>
                                {/* se usan  las propiedades exactas de tu variable 'carrito' */}
                                <td className="py-1 font-bold align-top">{item.cantidad}</td>
                                <td className="py-1 align-top font-bold">
                                    {item.producto?.name || 'Producto'}
                                </td>
                                <td className="py-1 font-semibold text-right align-top">${(item.precio * item.cantidad).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td colSpan={2} className="pb-1 font-semibold">
                                    {renderPersonalizacionTicket(item)}
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <p className="text-xs text-center mb-2">--------------------------------</p>

            {/* TOTALES */}
            <div className="text-right mb-6">
                <p className="text-xl font-bold">TOTAL: ${Number(orden.amount).toFixed(2)}</p>
            </div>

            {/* FOOTER */}
            <div className="text-center text-xs">
                <p className="font-bold">¡Gracias por tu preferencia!</p>
                <p className="mt-2 font-semibold">Síguenos en nuestras redes</p>
                <p className="font-semibold">@Gabunni</p>
                <br />
                <p>.</p>
            </div>
        </div>
    );
});

export default Ticket;
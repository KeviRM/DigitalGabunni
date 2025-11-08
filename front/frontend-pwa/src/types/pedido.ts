

export interface DetalePedidoAPI {
    product_name: string;
    quantity: number;
    unit_price: number;
    personalizacion_json: any;
}

export interface PedidoStatus{
    order_number: string;
    status: 'CONFIRMADO' | 'PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
    type_delivery: 'RECOGER' | 'DOMICILIO';
    created_at: string;
    amount: string;
    details: DetalePedidoAPI[];
}


export const EstadoAmigable: { [key: string]: string } = {

    CONFIRMADO: 'Pedido Confirmado',
    PREPARACION: 'En preparacion ¡Cocinandoce!',
    LISTO: 'Listo para Recoger o Envío',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',

};
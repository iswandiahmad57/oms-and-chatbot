<?php
class Shipping_model extends CI_Model{

    public function get_shipping($start,$limit,$searchValue=null,$sorting,$keyword,$itemByMonth,$itemByStatus){
       $this->db->select('shipping.*,order.*,cust.*,(SELECT SUM(itemQty) FROM sales_order_item where orderID=order.orderID) as jumlah')->from('shipment_order shipping')->join('sales_order order','order.orderID=shipping.orderID')->join('customers cust','order.customerID=cust.customerID');
        if($searchValue!="null" && $keyword!="customerName"){
            $this->db->like('invoices.'.$keyword,$searchValue);
        }
        if($searchValue!="null" && $keyword=="customerName"){
        	$this->db->like('cust.'.$keyword,$searchValue);
        }

        if($itemByStatus!="null"){
        	$this->db->where('shipping.shippingStatus',$itemByStatus);
        }

        if($itemByMonth!="null"){
        	$this->db->where('MONTH(shipping.tanggal_pengiriman)=',$itemByMonth);
        }

           
       $this->db->limit($limit,$start); 

       return $this->db->where('YEAR(shipping.tanggal_pengiriman)',PERIODE)->order_by('shipping.tanggal_pengiriman',$sorting)->get()->result();
    }
    public function get_invoice_by_customer($start,$limit,$customerID){
       $this->db->select('invoices.*,order.*,cust.*,(SELECT SUM(itemTotal) FROM sales_order_item where orderID=order.orderID) as jumlah,(SELECT SUM(itemQty) FROM sales_order_item where orderID=order.orderID) as totalbrg')->from('sales_invoices invoices')->join('sales_order order','order.orderID=invoices.orderID')->join('customers cust','order.customerID=cust.customerID')->where('order.orderID=invoices.orderID')->where('cust.customerID',$customerID);
       $this->db->limit($limit,$start); 

       return $this->db->where('YEAR(invoices.invoiceDate)',PERIODE)->order_by('invoices.invoiceDate','desc')->get()->result();
    }

    public function update_status($id,$status){

        $this->db->where('id',$id)->update('shipment_order',array('shippingStatus'=>$status));
        if($this->db->affected_rows()>0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function get_shipping_detail($shippingID){
        return $this->db->where('id',$shippingID)->get('shipment_order')->row();
    }

    public function update_shipping($id,$data){
        $this->db->where('id',$id)->update('shipment_order',$data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    //delete 
    public function delete_shipping($shippingID){
         $this->db->where('id', $shippingID)->delete('shipment_order');

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
}
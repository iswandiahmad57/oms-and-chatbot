<?php
class Invoices_model extends CI_Model{

    public function get_invoice($start,$limit,$searchValue=null,$sorting,$keyword,$itemByMonth,$itemByStatus){
       $this->db->select('invoices.*,order.*,cust.*,(SELECT SUM(itemTotal) FROM sales_order_item where orderID=order.orderID) as jumlah')->from('sales_invoices invoices')->join('sales_order order','order.orderID=invoices.orderID')->join('customers cust','order.customerID=cust.customerID');
        if($searchValue!="null" && $keyword!="customerName"){
            $this->db->like('invoices.'.$keyword,$searchValue);
        }
        if($searchValue!="null" && $keyword=="customerName"){
        	$this->db->like('cust.'.$keyword,$searchValue);
        }

        if($itemByStatus!="null"){
        	$this->db->where('invoices.invoiceStatus',$itemByStatus);
        }

        if($itemByMonth!="null"){
        	$this->db->where('MONTH(invoices.invoiceDate)=',$itemByMonth);
        }

        

           
       $this->db->limit($limit,$start); 

       return $this->db->where('YEAR(invoices.invoiceDate)',PERIODE)->order_by('invoices.invoiceDate',$sorting)->get()->result();
    }
    public function get_invoice_by_customer($start,$limit,$customerID){
       $this->db->select('invoices.*,order.*,cust.*,(SELECT SUM(itemTotal) FROM sales_order_item where orderID=order.orderID) as jumlah,(SELECT SUM(itemQty) FROM sales_order_item where orderID=order.orderID) as totalbrg')->from('sales_invoices invoices')->join('sales_order order','order.orderID=invoices.orderID')->join('customers cust','order.customerID=cust.customerID')->where('order.orderID=invoices.orderID')->where('cust.customerID',$customerID);
       $this->db->limit($limit,$start); 

       return $this->db->where('YEAR(invoices.invoiceDate)',PERIODE)->order_by('invoices.invoiceDate','desc')->get()->result();
    }
    public function get_invoice_detail($invoiceNumber){
        return $this->db->select('invoices.*,order.*,cust.*, (SELECT SUM(itemTotal) FROM sales_order_item where orderID=order.orderID) as jumlah')->from('sales_invoices invoices')->join('sales_order order','order.orderID=invoices.orderID')->join('customers cust','order.customerID=cust.customerID')->where('invoices.invoiceNumber',$invoiceNumber)->get()->row();
    }

    public function update_status($invoiceNumber,$status){

        $this->db->where('invoiceNumber',$invoiceNumber)->update('sales_invoices',array('invoiceStatus'=>$status));
        if($this->db->affected_rows()>0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function update_konfirmasi($status){

        $this->db->update('konfirmasi_pembayaran',array('status'=>$status));
        if($this->db->affected_rows()>0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function delete_invoices($invoiceID){
         $this->db->where('invoiceNumber', $invoiceID)->delete('sales_invoices');

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    
    public function tambah_konfirmasi($data){
        $this->db->insert('konfirmasi_pembayaran',$data);
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
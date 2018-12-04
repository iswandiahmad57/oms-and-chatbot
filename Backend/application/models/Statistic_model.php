<?php
class Statistic_model extends CI_Model{


    public function getOrderByTanggal($hari){
        $query="SELECT count('orderID') as jumlah FROM sales_order WHERE DAY(orderDate)='$hari'";


        return $this->db->query($query)->result();
    }

    public function getAllOrder(){
        $query="SELECT count('orderID') as jumlah FROM sales_order where YEAR(orderDate)='".PERIODE."'";
        return $this->db->query($query)->result();
    }

    public function getOrderDeadline($day){

        if($day=='0'){
            $quer="SELECT *,DATEDIFF(orderFinishDate,orderDate) as diff from sales_order where DATEDIFF(orderFinishDate,orderDate)< 0 AND YEAR(orderDate)=".PERIODE." ORDER BY orderNumber DESC lIMIT 0,5";
        }else{
             $quer="SELECT *, DATEDIFF(orderFinishDate,orderDate) as diff from sales_order where DATEDIFF(orderFinishDate,orderDate)".$day." AND DATEDIFF(orderFinishDate,orderDate)>=0  AND YEAR(orderDate)=".PERIODE." ORDER BY orderNumber DESC lIMIT 0,5";
        }

        return $this->db->query($quer)->result();
       
    }

    public function getInvoice(){
        return $this->db->select('*,DATEDIFF(invoiceDueDate,invoiceDate) as tenggat')->where('invoiceStatus','Waiting Payment')->where('YEAR(invoiceDate)',PERIODE)->order_by('invoiceNumber','desc')->LIMIT(0,5)->get('sales_invoices')->result();
    }

    public function getProductReport($month){
        if($month!=0){
            $query="SELECT p.nama,p.harga,p.productID,(SELECT sum(itemQty) FROM sales_order_item JOIN sales_order ON sales_order_item.orderID=sales_order.orderID WHERE MONTH(sales_order.orderDate)=".$month." AND productID=p.productID AND YEAR(sales_order.orderDate)=".PERIODE.") as qty ,(SELECT sum(itemTotal) FROM sales_order_item JOIN sales_order ON sales_order_item.orderID=sales_order.orderID WHERE MONTH(sales_order.orderDate)=".$month." AND productID=p.productID AND YEAR(sales_order.orderDate)=".PERIODE.") as jumlah from products p ORDER BY jumlah DESC";
        }else{
            $query="SELECT p.nama,p.harga,p.productID,(SELECT sum(itemQty) FROM sales_order_item  JOIN sales_order ON sales_order_item.orderID=sales_order.orderID where productID=p.productID AND YEAR(sales_order.orderDate)=".PERIODE.") as qty ,(SELECT sum(itemTotal) FROM sales_order_item JOIN sales_order ON sales_order_item.orderID=sales_order.orderID where productID=p.productID AND YEAR(sales_order.orderDate)=".PERIODE.") as jumlah from products p ORDER BY jumlah DESC";
        }


        return $this->db->query($query)->result();
    }

    public function getCustomerReport($month){

        if($month!=0){
            $query="SELECT cs.customerID,cs.customerName,cs.email,cs.phone,(IFNULL((SELECT sum(item.itemTotal) FROM sales_order sr JOIN sales_order_item item on sr.orderID=item.orderID where sr.customerID=cs.customerID and YEAR(sr.orderDate)=".PERIODE." AND MONTH(sr.orderDate)=".$month."),0)) as total from customers cs";
        }else{
          $query="SELECT cs.customerID,cs.customerName,cs.email,cs.phone,(IFNULL((SELECT sum(item.itemTotal) FROM sales_order sr JOIN sales_order_item item on sr.orderID=item.orderID where sr.customerID=cs.customerID and YEAR(sr.orderDate)=".PERIODE."),0)) as total from customers cs";
        }


        return $this->db->query($query)->result();
    }

    public function getCustomerReportID($id){
        $customerID=$id;
        $query="SELECT so.orderNumber,so.orderDate,(IFNULL((SELECT sum(item.itemTotal) FROM sales_order sr JOIN sales_order_item item on sr.orderID=item.orderID where sr.customerID=so.customerID and YEAR(sr.orderDate)=".PERIODE."),0)) as total,(IFNULL((SELECT sum(item.itemQty) FROM sales_order sr JOIN sales_order_item item on sr.orderID=item.orderID where sr.customerID=so.customerID and YEAR(sr.orderDate)=".PERIODE."),0)) as totalBarang from sales_order so where YEAR(so.orderDate)=".PERIODE." and so.customerID='".$customerID."'" ;

        return $this->db->query($query)->result();
    }

}
<?php

defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH . '/libraries/REST_Controller.php';

/**
 * This is an example of a few basic user interaction methods you could use
 * all done with a hardcoded array
 *
 * @package         CodeIgniter
 * @subpackage      Rest Server
 * @category        Controller
 * @author          Phil Sturgeon, Chris Kacerguis
 * @license         MIT
 * @link            https://github.com/chriskacerguis/codeigniter-restserver
 */
class Orders extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();
date_default_timezone_set('Asia/Jakarta');
        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        $this->load->model('order_model','model',TRUE);
        date_default_timezone_set('Asia/Jakarta');
    }

    //fungsi untuk mendapatkan seluruh bahasa
    public function order_post(){
        $id=md5(microtime());
        $data=array();
        
        foreach ($this->post() as $key => $value ) {
            # code...
            if($key != "item"){
                $data[$key]= trim($value);
            }
                
        }

       $data['orderID']=$id;
       $data['orderStatus']="Not Confirmed";
       $allOrder=count($this->db->get('sales_order')->result());
       $data['orderNumber']=date('Ymd',strtotime($data['orderDate'])).$allOrder;
       $data['orderFrom']="Manual";


       $newItem=$this->each_params('item',$data['orderID']);



       if($this->model->tambah_order($data)){     


                    $this->model->addNewItem($newItem);


                    $this->set_response(['status'=>'Success','data'=>'data Berhasil di inputkan'], REST_Controller::HTTP_CREATED);
 
                //return $data
            
        }else{
                // Set the response and exit
                $this->response([
                    'status' => 'Error',
                    'error' => 'Gagal Menginput Data',
                ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code            
        }  
    }
    public function changeStatus_put(){
        $orderID=$this->put('orderID');
        $status=$this->put('status');
        if($this->model->update_status($orderID,$status)){
           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }
    }
    public function order_put(){
        $param="";
        if($this->get()!=null){
            $param=$this->get('orderID');
     
        }else{
            $param=$this->put('orderID');
        }
        $data=array();
        foreach ($this->put() as $key=>$value ) {
            # code...
            if($key!="item"){
                if($key!="orderID"){
                    $data[$key]= trim($value);
                }

                
            }
                
        }

        // //update order 

        // //update Item (Cek Terlebih dahulu apakah ada tambahan jika ada maka tambahkan setelah di cek edit)
        // $itemData=array();
        // $newItem=array();
        // foreach ($this->put() as $key => $value) {
        //     # code...
        //     if($key=="item"){
        //         if($value->itemID!=''){
        //             $itemData[$key]=$value;
        //         }else{
        //             if($key!='itemID'){
        //                $newItem[$key]=$value; 
        //             }
        //             $newItem['itemID']=md5(microtime());
        //             $newItem['orderID']=$value->orderID;
                    
        //         }
        //     }
        // }
        // $this->model->updateItem($itemData);

        // if(count($newItem)!=0){
        //     $this->model->addNewItem($newItem);
        // }
        


        if($this->model->update_order($data,$this->each_params('item',null,'edit'),$param)){
           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }



        

    }

    function orderSim_get(){

        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword');
        
        $order=$this->model->get_orderSim($pageNumber,$itemsPerPage,$search,$sort,$keyword);
        $total_row=0;
        if($search!='null'){
            $this->db->like($keyword,$search);
             $total_row=count($this->db->get('sales_order')->result());
        }else{

            $total_row=count($this->db->get('sales_order')->result());
           
        }
        
        if(!empty($order)){
            $this->response(['status'=>'Success','data'=>$order,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }

    function order_detail_get(){
        $orderID=$this->get('orderID');
        $order=$this->model->get_order_detail($orderID);
        if(!empty($order)){
            $this->response(['status'=>'Success','data'=>$order], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }

    function order_item_get(){
        $orderID=$this->get('orderID');
        $order=$this->model->get_order_item($orderID);
        if(!empty($order)){
            $this->response(['status'=>'Success','data'=>$order], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        } 
    }
    public function order_get()
    {
        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword'); 
        $orderStatus=$this->get('status'); 
        $type=$this->get('type');    


        $orderFrom=!$this->get('orderFrom')?'Manual':$this->get('orderFrom');
        
        $order=$this->model->get_order($pageNumber,$itemsPerPage,$search,$sort,$keyword,$orderStatus,$type,$orderFrom);
        $total_row=count($order);


        // if($search!='null'){
        //     $this->db->like($keyword,$search);
        //      $total_row=count($this->db->get('sales_order')->result());
        // }else{
        //     $total_row=count($this->db->get('sales_order')->result());
           
        // }
        
        if(!empty($order)){
            $this->response(['status'=>'Success','data'=>$order,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }

    public function order_delete(){
        $param=$_GET['orderID'];  


         //cek apakah product ID ada didalam database

            //hapus data dari database;
            if($this->api->hapus_order($param)){
                 $this->response([
                    'status' => 'Success'
                    ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
             }else{
                $this->response([
                    'status' => 'Error'
                ], REST_Controller::HTTP_BAD_REQUEST); // BAD_REQUEST (400) being the HTTP response code                
             }


    }
    function item_delete(){
        $param=$_GET['itemID'];
         //cek apakah product ID ada didalam database
            //hapus data dari database;
            if($this->model->delete_item($param)){
                 $this->response([
                    'status' => 'Success',
                    'data' => (object)array()
                    ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
             }else{
                $this->response([
                    'status' => "Error",
                    'data' => (object)array()
                ], REST_Controller::HTTP_BAD_REQUEST); // BAD_REQUEST (400) being the HTTP response code                
             }

    }

    public function makeInvoice_post(){

    }

    public function deleteItem_delete(){
        $param=$_GET['itemID'];  

         //cek apakah product ID ada didalam database
            //hapus data dari database;
            if($this->api->hapus_orderItem($param)){
                 $this->response([
                    'status' => 'Success'
                    ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
             }else{
                $this->response([
                    'status' => 'Error'
                ], REST_Controller::HTTP_BAD_REQUEST); // BAD_REQUEST (400) being the HTTP response code                
             }        
    }
    //fungsi each parameter ini digunakan untuk mencocokkan parameter yang datang dengan field yang ada di dalam tabel
    public function each_params($specifiedObject,$order=null,$operation=null){

        //untuk tipe single atau variant
        $fields=$this->db->field_data('sales_order_item');
        $data=array();
        if($operation!="edit"){
            for ($i=0; $i < count($this->post($specifiedObject)); $i++) { 
                    # code...

                foreach ($fields as $field) {
                    # code...
                        if($field->name=="itemID"){
                            $data[$i]['itemID']=md5(microtime());
                        }elseif($field->name=="orderID"){
                            $data[$i]['orderID']=$order;
                        }else{
                            if(@$this->post($specifiedObject)[$i][$field->name]!=null){
                                 $data[$i][$field->name]=trim(strtolower($this->post($specifiedObject)[$i][$field->name]));
                                
                            }else{
                                $data[$i][$field->name]=null;
                            }
                        }


  

                }
            }
        }else{
            for ($i=0; $i < count($this->put($specifiedObject)); $i++) { 
                    # code...

                foreach ($fields as $field) {
                    # code...

                    if(@$this->put($specifiedObject)[$i][$field->name]!=null){
                         $data[$i][$field->name]=trim(strtolower($this->put($specifiedObject)[$i][$field->name]));
                        
                    }else{
                        $data[$i][$field->name]=null;
                    }

                }
            }
        }
      



        return $data;

    }

    public function cekStok_get(){
        $productID=$this->get('productID');
        $qty=$this->get('qty');
    
        $itemID=$this->get('itemID');
        $stok=$this->db->where('productID',$productID)->get('products')->row();

        $leftStok=$stok->stok - $stok->leftInHand;

    
            if($stok->readystok="Y"){
                if($itemID==null){
                    if($qty > $leftStok){
                        $this->set_response(['status'=>'error','data'=>$leftStok], REST_Controller::HTTP_CREATED);
                       
                    }else{
                         $this->set_response(['status'=>'cukup','data'=>''], REST_Controller::HTTP_CREATED);
                    }  
                }else{
                    $oldQty=$this->db->where('itemID',$itemID)->get('sales_order_item')->row();
                    $leftStok=$stok->stok - ($stok->leftInHand-$oldQty->itemQty);
                    if($qty > $leftStok){
                        $this->set_response(['status'=>'error','data'=>$oldQty->itemQty], REST_Controller::HTTP_CREATED);
                       
                    }else{
                         $this->set_response(['status'=>'cukup','data'=>''], REST_Controller::HTTP_CREATED);
                    }  
                }
       
            }
   



    }

    public function pengiriman_post(){
        $data=array();
        foreach ($this->post() as $key => $value ) {
            # code...
           
                $data[$key]= trim($value);
          
                
        }
      $data['id']=md5(microtime());
      $data['shippingStatus']="Pengiriman";
       if($this->model->tambah_pengiriman($data)){     
            //tambah item ke order item

            $this->set_response(['status'=>'Success','data'=>'data Berhasil di inputkan'], REST_Controller::HTTP_CREATED);
        }else{
                // Set the response and exit
                $this->response([
                    'status' => 'Error',
                    'error' => 'Gagal Menginput Data',
                ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code            
        }  
    }

    public function pengiriman_get(){

        $orderID=$this->get('orderID');

        $pengiriman=$this->db->where('orderID',$orderID)->get('shipment_order')->result();
        if(!empty($pengiriman)){
            $this->response(['status'=>'Success','data'=>$pengiriman], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }
    public function invoice_get(){

        $orderID=$this->get('orderID');

        $pengiriman=$this->db->select('invoices.*,order.*,cust.*')->from('sales_invoices invoices')->join('sales_order order','order.orderID=invoices.orderID')->join('customers cust','order.customerID=cust.customerID')->where('invoices.orderID',$orderID)->get()->row();
        if(!empty($pengiriman)){
            $this->response(['status'=>'Success','data'=>$pengiriman], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }

    public function invoice_services_get(){
        $orderID=$this->get('orderID');

        $invoice=$this->db->select('invoices.*,order.*,cust.*')->from('sales_invoices invoices')->join('sales_order order','order.orderID=invoices.orderID')->join('customers cust','order.customerID=cust.customerID')->where('invoices.orderID',$orderID)->get()->row();

        $item=$this->model->get_order_item($orderID);
        $invoice->item=$item;

        if(!empty($invoice)){
            $this->response(['status'=>'Success','data'=>$invoice], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }
    public function invoice_post(){
        $data=array();
        foreach ($this->post() as $key => $value ) {
            # code...
           
                $data[$key]= trim($value);
          
                
        }

      $allInvoice=count($this->db->get('sales_invoices')->result());
      $data['invoiceNumber']=date('Ymd',strtotime($data['invoiceDate'])).$allInvoice;

      $data['invoiceTotal']=$this->db->select('SUM(itemTotal) as total')->from('sales_order_item')->where('orderID',$data['orderID'])->get()->row()->total;
      $data['invoiceStatus']='Waiting Payment';
       if($this->model->tambah_invoice($data)){     
            $this->set_response(['status'=>'Success','data'=>'data Berhasil di inputkan'], REST_Controller::HTTP_CREATED);
        }else{
                // Set the response and exit
                $this->response([
                    'status' => 'Error',
                    'error' => 'Gagal Menginput Data',
                ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code            
        }  
    }

    public function sending_post(){

    }

    public function order_simple_get(){
        $orderSimple=$this->model->getOrderAll();
       
        if(!empty($orderSimple)){
            $this->response(['status'=>'Success','data'=>$orderSimple], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }


    public function cek_order_get(){
        $orderNumber=$this->get('orderNumber');

        $dataOrder=$this->db->where('orderNumber',$orderNumber)->get('sales_order')->row();

        //kembalikan order number
                // Set the response and exit

       
        if(!empty($dataOrder)){
            $this->response(['status'=>'Success','data'=>$dataOrder], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }       
 
    }

    public function order_services_post(){
        $id=md5(microtime());
        $data=array();




       $product=$this->db->where('productID',$this->post('productID'))->get('products')->row();
       $customer=$this->db->where('messengerID',$this->post('messengerID'))->get('customers')->row();
       $data['orderID']=$id;
       $data['orderStatus']="Not Confirmed";
       $allOrder=count($this->db->get('sales_order')->result());
       $data['orderName']="Order ". $product->nama;
       $data['orderDate']=date("Y-m-d");
       $data['orderNumber']=date('Ymd',strtotime($data['orderDate'])).$allOrder;


       $item['productID']=$this->post('productID');
       $item['itemUnitPrice']=$product->harga;
       $item['itemQty']=$this->post('jumlahPesanan');
       $item['itemTotal']=$item['itemQty']*$item['itemUnitPrice'];
       $item['extra']="N";
       $item['orderID']=$id;
       $item['itemID']=md5(microtime());



       $data['orderFinishDate']=date("Y-m-d",strtotime("+10 days"));
       $data['customerID']=$customer->customerID;
       $data['orderDeliveryAddress']=$customer->address;
       $setting = (object)json_decode(file_get_contents(base_url()."setting.json"),true);
       $data['orderDeliveryInstruction']=!empty($setting->invoice['payment_detail'])?$setting->invoice['payment_detail']:'Silhkan hubungi customer service';
       $data['orderFrom']='Messenger';



       // var_dump($this->post);

       if($this->model->tambah_order($data)){  
       
                    $this->model->addItem($item);
                    $this->set_response(['status'=>'Success','data'=>array("orderNumber"=>$data['orderNumber'])], REST_Controller::HTTP_OK);
 
                //return $data
            
        }else{
                // Set the response and exit
                $this->response([
                    'status' => 'Error',
                    'data' => 'Gagal Menginput Data',
                ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code            
        }  
    }

}

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
class Shipping extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();

        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        $this->load->model('shipping_model','model',TRUE);
        $this->load->model('order_model','order',TRUE);
        date_default_timezone_set('Asia/Jakarta');
    }




    public function shipping_get(){
     
        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword'); 
        $itemByMonth=$this->get('itemByMonth');
        $itemByStatus=$this->get('itemByStatus');     
        $shipping=$this->model->get_shipping($pageNumber,$itemsPerPage,$search,$sort,$keyword,$itemByMonth,$itemByStatus);
        $total_row=count($shipping);

        // var_dump($this->db->last_query());
        // if($search!='null'){
        //     $this->db->like($keyword,$search);
        //      $total_row=count($this->db->get('sales_order')->result());
        // }else{
        //     $total_row=count($this->db->get('sales_order')->result());
           
        // }



        if(!empty($shipping)){
            $this->response(['status'=>'Success','data'=>$shipping,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }

    public function invoice_by_customer_get(){
        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;

        $customerID=$this->get('customerID');  

        $invoice=array();  
        $invoice['invoice']=$this->model->get_invoice_by_customer($pageNumber,$itemsPerPage,$customerID);


        $invoice['total_barang']=0;
        $invoice['total_transaksi']=0;
        foreach ($invoice['invoice'] as $row) {
            # code...
                # code...
            $invoice['total_barang']+=$row->totalbrg;

            $invoice['total_transaksi']+=$row->jumlah;
   

        }

        $total_row=count($invoice['total_transaksi']);

        // var_dump($this->db->last_query());
        // if($search!='null'){
        //     $this->db->like($keyword,$search);
        //      $total_row=count($this->db->get('sales_order')->result());
        // }else{
        //     $total_row=count($this->db->get('sales_order')->result());
           
        // }



        if(!empty($invoice)){
            $this->response(['status'=>'Success','data'=>$invoice,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }


    public function changeStatus_put(){
        $status=$this->put('status');
        $id=$this->put('id');
        if($this->model->update_status($id,$status)){
            $orderID=$this->db->where('id',$id)->get('shipment_order')->row();
            if($status=='Diterima'){
              
                $update=$this->db->where('orderID',$orderID->orderID)->update('sales_order',array('orderStatus'=>'Done'));   
            }else{
                $update=$this->db->where('orderID',$orderID->orderID)->update('sales_order',array('orderStatus'=>'Shipping'));   
            }


           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }
    }


    public function shippingDetail_get(){
        $shippingID=$this->get('id');
        $shipping=$this->model->get_shipping_detail($shippingID);

        
        if(!empty($shipping)){
            $this->response(['status'=>'Success','data'=>$shipping], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }
    public function shipping_put(){
    
        $param="";
        if($this->get()!=null){
            $param=$this->get('id');
     
        }else{
            $param=$this->put('id');
        }

        $data=array();
        $i=0;
        foreach ($this->put() as $key=>$value ) {
            # code...
            if($value != null){
                if($key != 'id'){
                    $data[$key]= trim($value);
                }
                
            }
        }
        if($this->model->update_shipping($param,$data)){
           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }


    }

    function shipping_delete(){
        $param=$_GET['shippingID'];
         //cek apakah product ID ada didalam database
            //hapus data dari database;

            $inf=$this->db->where('id',$param)->get('shipment_order')->row();

            if($this->model->delete_shipping($param)){

                $this->db->where('orderID',$inf->orderID)->update('sales_order',array('orderStatus'=>'Confirmed'));
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
}

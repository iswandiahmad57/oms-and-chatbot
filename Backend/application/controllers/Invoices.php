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
class Invoices extends REST_Controller {

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
        $this->load->model('invoices_model','model',TRUE);
        $this->load->model('order_model','order',TRUE);
    }




    public function invoice_get(){
     
        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword'); 
        $itemByMonth=$this->get('itemByMonth');
        $itemByStatus=$this->get('itemByStatus'); 
    
        $invoice=$this->model->get_invoice($pageNumber,$itemsPerPage,$search,$sort,$keyword,$itemByMonth,$itemByStatus);
        $total_row=count($invoice);

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

    public function detail_get(){
        $invoiceID=$this->get('invoiceNumber');
        $invoice=$this->model->get_invoice_detail($invoiceID);
 

        //get Item
        $item=$this->order->get_order_item($invoice->orderID);
     
        $invoice->item=$item;
        if(!empty($invoice)){
            $this->response(['status'=>'Success','data'=>$invoice], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }
    public function konfirmasi_get(){

 

        //get Item
        $konfirmasi=$this->db->order_by('id','desc')->get('konfirmasi_pembayaran')->result();
     
     
        if(!empty($konfirmasi)){
            $this->response(['status'=>'Success','data'=>$konfirmasi], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }
    public function konfirmasi_pembayaran_post(){
        
        $data=array();
        $data['orderNumber']=$this->post('orderNumber');
        $data['tanggal']=date('Y-m-d');
        $data['keterangan']=$this->post('keterangan');
        
        //get orderID=
        $orderID=$this->db->where('orderNumber',$data['orderNumber'])->get('sales_order')->row();
           $cek=$this->db->where('orderID',$orderID->orderID)->get('sales_invoices')->row();
           
        if(!empty($cek)){
            if($this->model->tambah_konfirmasi($data)){
                
                //cek apakah terdapat invoice atau tidak
          
               $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
            }else{
                $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
            }
        }else{
            $this->response(['status'=>'Error invoice','data'=>(object)array()], REST_Controller::HTTP_OK);
        }

    }
    
    public function konfirmasiChange_put(){
        $status='read';
        if($this->model->update_konfirmasi($status)){
           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }
    }
    public function changeStatus_put(){
        $status=$this->put('status');
        $invoiceNumber=$this->put('invoiceNumber');
        if($this->model->update_status($invoiceNumber,$status)){
           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }
    }

    // function invoice_delete(){
    //     $param=$_GET['invoiceID'];
    //      //cek apakah product ID ada didalam database
    //         //hapus data dari database;
    //         if($this->model->delete_invoices($param)){
    //              $this->response([
    //                 'status' => 'Success',
    //                 'data' => (object)array()
    //                 ], REST_Controller::HTTP_CREATED); // NO_CONTENT (204) being the HTTP response code               
    //          }else{
    //             $this->response([
    //                 'status' => "Error",
    //                 'data' => (object)array()
    //             ], REST_Controller::HTTP_BAD_REQUEST); // BAD_REQUEST (400) being the HTTP response code                
    //          }

    // }


    function invoice_delete(){
        $param=$_GET['invoiceNumber'];
         //cek apakah product ID ada didalam database
            //hapus data dari database;

           

            if($this->model->delete_invoices($param)){

            
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

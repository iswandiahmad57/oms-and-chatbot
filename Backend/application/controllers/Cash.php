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
class Cash extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();

        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        $this->load->model('api_models','api',TRUE);
    }

    //fungsi untuk mendapatkan seluruh bahasa
    public function cashAccount_post(){
        $id=md5(microtime());
        $data=array();
        foreach ($this->post() as $key=>$value ) {
            # code...
            $data[$key]= $value;    
        }

       $data['accountcashID']=$id;
       $data['accountcashCode']=strtoupper(substr($id, 3).substr($id, ceil(strlen($id)/2),4).substr($id, -3));
       $data['accountcashCreate']=date('Y-m-d');
       if($this->api->tambah_cashAccount($data)){              
                //return $data
             $this->set_response(['status'=>'Success','data'=>'data Berhasil di inputkan'], REST_Controller::HTTP_CREATED);
        }else{
                // Set the response and exit
                $this->response([
                    'status' => 'Error',
                    'error' => 'Gagal Menginput Data',
                ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code            
        }  
    }
    public function cashAccount_get()
    {
        $param="";


        if($this->get()!=null){
            $param=$this->get('accountCashID');
            $customer=$this->api->get_CashAccount($param);
     
        }else{
             $customer=$this->api->get_CashAccountAll();
     
        }
        
        if(!empty($customer)){ //cek apakah terdapat record atau tidak
            $this->response($customer, REST_Controller::HTTP_OK);
        }else{
            $this->response(REST_Controller::HTTP_NOT_FOUND);           
        }
    }

    // public function customer_put(){
    //     $param="";
    //     if($this->get()!=null){
    //         $param=$this->get('customerID');
     
    //     }else{
    //         $param=$this->put('customerID');
    //     }
        

    //     $data=array();
    //     $i=0;
    //     foreach ($this->put() as $key=>$value ) {
    //         # code...


    //         if($value != null){
    //             if($key != 'customerID'){
    //                 $data[$key]= trim($value);
    //             }
                
    //         }
    //     }


    //     if($this->api->updateCustomer($param,$data)){
            
    //         $this->set_response(['status' => 'Success'], REST_Controller::HTTP_CREATED);
    //     }
    //     else{

    //         $this->response(['status' => 'Error'], REST_Controller::HTTP_NOT_FOUND);            
    //     }

    // }

}

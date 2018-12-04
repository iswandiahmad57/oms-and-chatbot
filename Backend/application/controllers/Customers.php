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
class Customers extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();
        ini_set( 'memory_limit', '200M' );
        ini_set('upload_max_filesize', '200M');
        ini_set('post_max_size', '200M');
        ini_set('max_input_time', 3600);
        ini_set('max_execution_time', 3600);
    date_default_timezone_set('Asia/Jakarta');
        $this->allowed_types['file']        = array('pdf','doc','docx','xls','xlsx','ppt','pptx','rtf');
        $this->allowed_types['image']       = array('gif','jpg','jpeg','png','bmp');
        $this->allowed_types['media']       = array('mp3','mp4','qt','mov','wmp');

        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key


        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        $this->load->model('customer_model','model',TRUE);
    }

    //fungsi untuk mendapatkan seluruh bahasa
    public function customer_post(){
        $id=md5(microtime());
        $data=array();
        foreach ($this->post() as $key=>$value ) {
            # code...
            $data[$key]= $value;    
        }

       $data['customerID']=$id;
       $data['joinDate']=date('Y-m-d');


       //cek email

       if($this->db->where('email',$data['email'])->get('customers')->num_rows()>0){
            $this->set_response(['status'=>'Error Email','data'=>(object)array()], REST_Controller::HTTP_CREATED);
       }else{
           if($this->model->tambah_customer($data)){              
                    //return $data
                 $this->set_response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_CREATED);
            }else{
                    // Set the response and exit
                    $this->response([
                        'status' => 'Error',
                        'data' => (object)array(),
                    ], REST_Controller::HTTP_OK); // NOT_FOUND (404) being the HTTP response code            
            }
       }
  
    }
    public function customer_get()
    {
        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword');   
        $type=$this->get('type');   
        $customer=$this->model->get_customer($pageNumber,$itemsPerPage,$search,$sort,$keyword,$type);
        // $total_row=0;
        // if($search!='null'){
        //     $this->db->like($keyword,$search);
        //      $total_row=count($this->db->get('customers')->result());
        // }else{
        //     $total_row=count($this->db->get('customers')->result());
           
        // }
         $total_row=count($customer);
        
        if(!empty($customer)){
            $this->response(['status'=>'Success','data'=>$customer,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$total_row],REST_Controller::HTTP_OK);
        }
    }

    function customer_detail_get(){
        $customerID=$this->get('customerID');
        $customer=$this->model->get_customer_detail($customerID);
        if(!empty($customer)){
            $this->response(['status'=>'Success','data'=>$customer], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }

    public function customer_edit_put(){
        $param="";
        if($this->get()!=null){
            $param=$this->get('customerID');
     
        }else{
            $param=$this->put('customerID');
        }

        $data=array();
        $i=0;
        foreach ($this->put() as $key=>$value ) {
            # code...
            if($value != null){
                if($key != 'customerID'){
                    $data[$key]= trim($value);
                }
                
            }
        }
   
        if($this->model->update_customer($param, $data)){
           $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }
    

    }

    public function allCust_get(){

        $cust=$this->db->get('customers')->result();
        if($cust){
           $this->response(['status'=>'Success','data'=>$cust], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()], REST_Controller::HTTP_OK);
        }
    }

    public function customer_delete(){
        $param=$_GET['customerID'];
        if($this->model->delete_customer($param)){
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

    //delete with collect
    function customerCollect_post(){
        $param=$this->post();
            if($this->model->delete_customerCollect($param)){
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

    public function uploadmedia_post()
    {

        $pathinfo   = pathinfo($_FILES['file']["name"]);
        $newname    = md5(microtime()).'.'.$pathinfo['extension'];
        $config = array(
            "file_name"     => $newname,
            "overwrite"     => TRUE,
            "upload_path"   => './uploads/customer/',
            "max_size"      => '1000000',
            "allowed_types" => implode('|', $this->allowed_types['image'])
        );

        $this->load->library('upload');
        $this->load->library('image_lib');
        $this->upload->initialize($config);
        
        if ($this->upload->do_upload('file')):
            $this->response(['status'=>'Success','newname'=>$newname,'code'=>'#ER01','message'=>$this->upload->display_errors().', allowed Types:'.implode('|', $this->allowed_types['image']).', your file type are uploaded:'.$pathinfo['extension'],'file'=>$this->upload->data()],REST_Controller::HTTP_OK);
        else:
            $this->response(['status'=>'Error','code'=>'#ER01','message'=>$this->upload->display_errors().', allowed Types:'.implode('|', $this->allowed_types['image']).', your file type are uploaded:'.$pathinfo['extension'],'file'=>$this->upload->data()],REST_Controller::HTTP_NOT_FOUND);
        endif;
    }

    public function unlink_post(){
        $nama_file=$this->post('namaFile');

        unlink('./uploads/customer/'.$nama_file);
        $this->response(['status'=>'Success'],REST_Controller::HTTP_OK);

    }

    /// for messenger

    public function detail_get(){
         $this->response(['status'=>'Error','data'=>array("data"=>
            "dsfasdf"
            )],REST_Controller::HTTP_OK);
        // $messengerID=$this->get('messengerID');
        // $customer=$this->db->where('messengerID',$messengerID)->get('customers')->row();
        // var_dump($this->get);
        // if(!empty($customer)){
        //     $this->response(['status'=>'Success','data'=>$customer], REST_Controller::HTTP_OK);
        // }else{
        //     $this->response(['status'=>'Error','data'=>array("data"=>$messengerID)],REST_Controller::HTTP_OK);
        // }
    }

    public function customer_services_get(){
        $messengerID=$this->get('messengerID');
        $customer=$this->db->where('messengerID',$messengerID)->where('messengerID!=','')->get('customers')->row();
        if(!empty($customer)){
            $this->response(['status'=>'Success','data'=>$customer], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }
    public function customer_servicesEmail_get(){
        $email=$this->get('email');
        $customer=$this->db->where('email',$email)->get('customers')->row();
        if(!empty($customer)){
            $this->response(['status'=>'Success','data'=>$customer], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }
    }

    public function customer_services_post(){
        $id=md5(microtime());
        $data=array();
        foreach ($this->post() as $key=>$value ) {
            # code...
            $data[$key]= $value;    
        }


       //jika file adalah edit
       if($data['operation']=="Edit"){
           unset($data['operation']);
           if($this->model->update_customer_byMessengerID($data['messengerID'],$data)){              
                    //return $data
                 $this->set_response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
            }else{
                    // Set the response and exit
                    $this->response([
                        'status' => 'Error',
                        'data' => (object)array(),
                    ], REST_Controller::HTTP_OK); // NOT_FOUND (404) being the HTTP response code            
            }  
       }else{
           unset($data['operation']);
           $data['customerID']=$id;
           $data['joinDate']=date('Y-m-d');
           $customerEmail=$this->db->where('email',$data['email'])->get('customers')->row();
           //cek email terlebih dahulu
      
           if(!empty($customerEmail)){
            $this->set_response(['status'=>'Email Error','data'=>(object)array()], REST_Controller::HTTP_OK);
           }else{
               if($this->model->tambah_customer($data)){              
                        //return $data
                     $this->set_response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
                }else{
                        // Set the response and exit
                        $this->response([
                            'status' => 'Error',
                            'data' => (object)array(),
                        ], REST_Controller::HTTP_OK); // NOT_FOUND (404) being the HTTP response code            
                }  
           }
       }


    }

}

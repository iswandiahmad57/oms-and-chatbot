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
class Employes extends REST_Controller {

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
        $this->load->model('pegawai_model','api',TRUE);
    }

    //fungsi untuk mendapatkan seluruh bahasa
    public function employe_post(){
        $id=md5(microtime());
        $data=array();
        foreach ($this->post() as $key=>$value ) {
            # code...
            $data[$key]= $value;    
        }

       $data['employeID']=$id;
       
       $data['password']=md5($this->post('password'));
    
       if($this->api->tambah_employe($data)){              
                //return $data
             $this->response(['status'=>'Success','data'=>(object)array()], REST_Controller::HTTP_OK);
        }else{
                $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);         
        }  


    }
    public function employe_get()
    {
        $itemsPerPage=$this->get('limit');
        $pageNumber=($this->get('start')-1)*$itemsPerPage;
        $search=!empty($this->get('search'))?$this->get('search'):null;
        $sort=$this->get('sort');
        $keyword=$this->get('keyword');      
        $pegawai=$this->api->get_employe($pageNumber,$itemsPerPage,$search,$sort,$keyword);
        $total_row=0;
        if($search!='null'){
            $this->db->like($keyword,$search);
             $total_row=count($this->db->get('employes')->result());
        }else{
            $total_row=count($this->db->get('employes')->result());
           
        }
        
        if(!empty($pegawai)){
            $this->response(['status'=>'Success','data'=>$pegawai,'total_row'=>$total_row], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array(),'total_row'=>$pegawai],REST_Controller::HTTP_OK);
        }
    }

    public function employe_put(){
        $param="";
        if($this->get()!=null){
            $param=$this->get('employeID');
     
        }else{
            $param=$this->put('employeID');
        }

        $data=array();
        $i=0;


        foreach ($this->put() as $key=>$value ) {
            # code...
            if($value != null){
                if($key != 'employeID'){
                    $data[$key]= trim($value);
                }
                
            }
        }
        $pas=$data['password'];

        $data['password']=md5($pas);

        if($this->api->update_employe($param,$data)){
            
            $this->set_response(['status' => 'Success'], REST_Controller::HTTP_CREATED);
        }
        else{

            $this->response(['status' => 'Error'], REST_Controller::HTTP_NOT_FOUND);            
        }

    }
    function employe_detail_get(){
        $employeID=$this->get('employeID');
        $employe=$this->api->get_employe_detail($employeID);
        if(!empty($employe)){
            $this->response(['status'=>'Success','data'=>$employe], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_NOT_FOUND);
        }
    }

    //delete with collect
    function employeCollect_post(){
        $param=$this->post();
            if($this->api->delete_employeCollect($param)){
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
    public function employe_delete(){
        $param=$_GET['employeID'];  

        if($this->api->delete_employe($param)){
            
            $this->set_response(['status' => 'Success'], REST_Controller::HTTP_CREATED);
        }
        else{

            $this->response(['status' => 'Error'], REST_Controller::HTTP_NOT_FOUND);            
        }   
    }

    // public function task_post(){
    //     $id=md5(microtime());
    //     $data=array();
    //     foreach ($this->post() as $key=>$value ) {
    //         # code...
    //         $data[$key]= $value;    
    //     }

    //    $data['taskID']=$id;
    //    $data['taskStatus']="Proggress";
    
    //    if($this->api->tambah_task($data)){              
    //             //return $data
    //          $this->set_response(['status'=>'Success','data'=>'data Berhasil di inputkan'], REST_Controller::HTTP_CREATED);
    //     }else{
    //             // Set the response and exit
    //             $this->response([
    //                 'status' => 'Error',
    //                 'error' => 'Gagal Menginput Data',
    //             ], REST_Controller::HTTP_NOT_FOUND); // NOT_FOUND (404) being the HTTP response code            
    //     }  
    // }

    public function login_post(){
        $email=$this->post('email');
        $password=$this->post('password');

        $pegawai=$this->api->cek_user($email,$password);
        $data=array();

        if(!empty($pegawai)){
            $data['name']=$pegawai->name;
            $data['role']=$pegawai->role;
            $data['token']=md5(microtime());
            $data['email']=$pegawai->email;
            $this->response(['status'=>'Success','data'=>$data], REST_Controller::HTTP_OK);
        }else{
            $this->response(['status'=>'Error','data'=>(object)array()],REST_Controller::HTTP_OK);
        }

    }

}

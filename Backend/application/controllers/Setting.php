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
class Setting extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();

        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['user_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['user_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['user_delete']['limit'] = 50; // 50 requests per hour per user/key
        $this->load->model('product_model','model',TRUE);
        date_default_timezone_set('Asia/Jakarta');
        $this->load->library('form_validation');
        

    }

    public function setting_post(){

        $setting=array('umum'=>array("nama_perusahaan"=>$this->post('nama_perusahaan'),
                                     "alamat"=>$this->post('alamat'),
                                     "no_telp1"=>$this->post('no_telp1'),
                                     "no_telp2"=>$this->post('no_telp2'),
                                     "logo_perusahaan"=>$this->post('logo_perusahaan'),
                                     "email"=>$this->post('email')),
                        'invoice'=>array("payment_detail"=>$this->post('payment_detail')),
                        'periode'=>array("tahun"=>$this->post('periode')?$this->post('periode'):date("Y"))
        );
         
        $json = json_encode($setting);
         
        //Save the file.
        file_put_contents("setting.json", $json);
         $this->response(['status'=>'Success','data'=>$json], REST_Controller::HTTP_OK);
    }

    public function setting_get(){
          $setting = (object)json_decode(file_get_contents(base_url()."setting.json"),true);

          $this->response(['status'=>'Success','data'=>$setting], REST_Controller::HTTP_OK);
         
    }






  
    
}

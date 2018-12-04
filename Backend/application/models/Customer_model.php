<?php
class Customer_model extends CI_Model {
	public $table_customer='customers';


    function run($module = '', $group = '') {
        (is_object($module)) AND $this->CI = &$module;
        return parent::run($group);
    }
    public function rules_tambah()
    {
        $form = array(
                        array(
                            'field' => 'sku',
                            'label' => 'SKU',
                            'rules' => "required|callback_is_sku_exist"
                        ),
                        array(
                            'field' => 'nama',
                            'label' => 'Nama',
                            'rules' => 'required'
                        ),
                        array(
                            'field' => 'jenis',
                            'label' => 'jenis',
                            'rules' => 'required'
                        )

        );
        return $form;
    }

    public function validasi_tambah($post)
    {
    	$_POST=$post;

        $form = $this->rules_tambah();
        $this->form_validation->set_rules($form);

        if ($this->form_validation->run())
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }


    function tambah_customer($data=array()){
        $this->db->insert('customers', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }



    public function get_customer($start,$limit,$searchValue=null,$sorting,$keyword,$type){
    
        if($searchValue!="null"){
            $this->db->like($keyword,$searchValue);
        }

        if($type=='chatbot'){
            $this->db->where('messengerID !=','');
        }else{
             $this->db->where('messengerID =','');
        }

          
           $this->db->limit($limit,$start); 

           $this->db->order_by('joinDate',$sorting);

        

        return $this->db->get($this->table_customer)->result();
    }

    public function get_customer_detail($customerID){
    	return $this->db->where('customerID',$customerID)->get($this->table_customer)->row();
    }
  

    public function update_customer($id,$data){
        $this->db->where('customerID',$id)->update('customers',$data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function update_customer_byMessengerID($id,$data){
        $this->db->where('messengerID',$id)->update('customers',$data);
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
    public function delete_customer($id){
        $this->db->where('customerID', $id)->delete('customers');

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function delete_customerCollect($customerID){

        for ($i=0; $i <count($customerID) ; $i++) { 
            # code...
            $this->db->where('customerID', $customerID[$i])->delete($this->table_customer);
        }
         

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function delete_productCollect($productID){

        for ($i=0; $i <count($productID) ; $i++) { 
            # code...
            $this->db->where('productID', $productID[$i])->delete($this->table_product);
        }
         

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function update_product($data){

        $this->db->where('productID',$data['productID'])->update($this->table_product,$data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }

    public function is_sku_exist()
    {
    	 $this->form_validation->set_message('is_sku_exist',"SKU ini sudah terdaftar");
        $sku=$this->post('sku');
        // cek database untuk sku yang sama
        $query = $this->db->get_where('products', array('sku' => $sku));
        if($query->num_rows() > 0)
        {
           
            return FALSE;
        }
        else
        {
            return TRUE;
        }
        
    }



}
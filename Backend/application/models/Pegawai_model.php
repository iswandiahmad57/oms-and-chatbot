<?php
class Pegawai_model extends CI_Model {

   //CustomerS Start Section
    function tambah_employe($data=array()){
        $this->db->insert('employes', $data);

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function update_employe($id,$data){
        $this->db->where('employeID',$id)->update('employes',$data);
        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function delete_employe($id){
        $this->db->where('employeID', $id)->delete('employes');

        if($this->db->affected_rows() > 0)
        {
            return TRUE;
        }
        else
        {
            return FALSE;
        }
    }
    public function get_employe_detail($employeID){
    	return $this->db->where('employeID',$employeID)->get('employes')->row();
    }
    public function get_employeAll(){
        return $this->db->order_by('employeID','DESC')->get('employes')->result();
    }

    public function get_employe($start,$limit,$searchValue=null,$sorting,$keyword){
    
        if($searchValue!="null"){
            $this->db->like($keyword,$searchValue);
        }

         $this->db->where('role !=','Admin');
         $this->db->limit($limit,$start); 


        

        return $this->db->get('employes')->result();
    }

    public function delete_employeCollect($employeID){

        for ($i=0; $i <count($employeID) ; $i++) { 
            # code...
            $this->db->where('employeID', $employeID[$i])->delete('employes');
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

    public function cek_user($email,$passwords)
    {
        $email = $email;
        $password = md5($passwords);
        $query = $this->db->where('email', $email)
                          ->where('password', $password)
                          ->limit(1)
                          ->get('employes')->row();


       

    return $query;
    }

}
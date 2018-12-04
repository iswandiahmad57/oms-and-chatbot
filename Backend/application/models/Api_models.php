<?php
class Api_models extends CI_Model {


      // cek status user, login atau tidak?
    public function cek_user()
    {
        $username = $this->input->post('username');
        $password = $this->gumcrypt->gumencrypt($this->input->post('password'));

        $query = $this->db->where('username', $username)
                          ->where('password', $password)
                          ->limit(1)
                          ->get('employes');
       

        if ($query->num_rows() == 1)
        {
             $user=$query->row();
            $data = array('login'=>true,'type'=>$user->userType,'userID'=>$user->userID);
            // buat data session jika login benar
            $this->session->set_userdata($data);
            return TRUE;


        }
        else
        {
            return FALSE;
        }
    }

    public function logout()
    {
        $this->session->unset_userdata(array('username' => '', 'login' => FALSE));
        $this->session->sess_destroy();
    }
    public function logout_special(){
         $this->session->sess_destroy();
        $this->session->unset_userdata(array('username' => '', 'login' => FALSE));
        
    }

    public function get_menu($type){
        return $this->db->select('*')
                ->from('menus')
                ->join('menulist','menus.menulistID=menulist.listID')
                ->where('menus.menuType',$type)
                ->get()
                ->result();
    }
}   

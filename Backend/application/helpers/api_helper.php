<?php

function tgl_indo($tgl){
    $ubah = gmdate($tgl, time()+60*60*8);
    $pecah = explode("-",$ubah);
    $tanggal = $pecah[2];
    $bulan = bulan($pecah[1]);
    $tahun = $pecah[0];
    return $tanggal.' '.$bulan.' '.$tahun;
}


function tgldikit($tgl){
 
        $inttime=date('Y-m-d H:i:s',$tgl);
 
        $arr_bulan=array("","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des");
        $tglBaru=explode(" ",$inttime);
        $tglBaru1=$tglBaru[0];$tglBaru2=$tglBaru[1];
        $tglBarua=explode("-",$tglBaru1);
        $tgl=$tglBarua[2]; $bln=$tglBarua[1]; $thn=$tglBarua[0];
        if(substr($bln,0,1)=="0") $bln=substr($bln,1,1);
        $bln=substr($arr_bulan[$bln],0,10);
        $ubahTanggal="$tgl $bln $thn";
 
     return $ubahTanggal;
}

//fungsi ini digunakan untuk memecah parameter dan value yang dikirim melalui http post
function each_parameter($table){

}
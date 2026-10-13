import test from 'node:test';
import assert from 'node:assert/strict';
import {validateContact} from '../lib/contact-form.ts';

test('contact form accepts Czech phone formatting and email, and identifies invalid fields',()=>{
 for(const contact of ['jana@example.cz','+420 733 428 135','733-428-135','(733) 428 135'])
   assert.deepEqual(validateContact({name:'Jana',contact,message:'Chci probrat bydlení.'}),{});
 for(const contact of ['jana@','telefon','12345678','+420123456789012345'])
   assert.ok(validateContact({name:'Jana',contact,message:'Dotaz'}).contact);
 const errors=validateContact({name:' ',contact:'',message:' '});
 assert.deepEqual(Object.keys(errors),['name','contact','message']);
});

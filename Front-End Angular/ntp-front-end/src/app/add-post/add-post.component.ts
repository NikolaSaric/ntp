import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Post } from '../models/post';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,private snackBar: MatSnackBar,
              private router: Router, private postService: PostService) { }

    addPostForm: FormGroup;

  ngOnInit() {
    this.addPostForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      tags: this.formBuilder.array([
        new FormControl()
      ]),
      links: this.formBuilder.array([
        new FormControl()
      ]),
      description: ['', [Validators.maxLength(250)]]
    });
  }

addTag() {
  const control = this.addPostForm.controls.tags as FormArray;
  control.push(new FormControl());
}

removeTag(index: number) {
  const control = this.addPostForm.controls.tags as FormArray;
  control.removeAt(index);
}

addLink() {
  const control = this.addPostForm.controls.links as FormArray;
  control.push(new FormControl());
}

removeLink(index: number) {
  const control = this.addPostForm.controls.links as FormArray;
  control.removeAt(index);
}

get name() { return this.addPostForm.controls.name.value as string; }
get links() { return this.addPostForm.controls.links.value as string[]; }
get tags() { return this.addPostForm.controls.tags.value as string[]; }
get description() { return this.addPostForm.controls.description.value as string; }

onAddPostSubmit() {
  const newPost = new Post(this.name, this.description, this.links, this.tags);

  this.postService.addPost(newPost).subscribe(
    (response => {
      console.log(response);
    })
  );
}

}
